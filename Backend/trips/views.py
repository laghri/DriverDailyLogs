from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import requests
import os

from .models import Trip, TripLeg, DailyLog
from .serializers import TripSerializer, TripInputSerializer
from .hos_calculator import HOSCalculator

ORS_API_KEY = os.getenv("ORS_API_KEY")

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().order_by('-created_at')
    serializer_class = TripSerializer

    @action(detail=False, methods=['post'])
    def calculate(self, request):
        input_serializer = TripInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = input_serializer.validated_data

        trip = Trip.objects.create(
            current_location=data['current_location'],
            pickup_location=data['pickup_location'],
            dropoff_location=data['dropoff_location'],
            current_cycle_used=data['current_cycle_used']
        )

        try:
            route_data = self._get_route_from_ors(
                data['current_location'],
                data['pickup_location'],
                data['dropoff_location']
            )

            if not route_data:
                trip.delete()
                return Response({'error': 'Could not calculate route'}, status=status.HTTP_400_BAD_REQUEST)

            trip.total_distance = route_data['distance']
            trip.total_duration = route_data['duration']
            trip.route_geometry = route_data['geometry']
            trip.save()

            trip_legs = self._calculate_trip_legs(trip, route_data)
            daily_logs = self._generate_daily_logs(trip, trip_legs)

            serializer = TripSerializer(trip)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            trip.delete()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_route_from_ors(self, current_loc, pickup_loc, dropoff_loc):
        coords = []
        for loc in [current_loc, pickup_loc, dropoff_loc]:
            c = self._geocode_location_ors(loc)
            if c:
                coords.append(c)  # [lng, lat]
        if len(coords) < 3:
            return None

        url = "https://api.openrouteservice.org/v2/directions/driving-car"
        body = {"coordinates": coords}
        headers = {"Authorization": ORS_API_KEY, "Content-Type": "application/json"}

        resp = requests.post(url, json=body, headers=headers, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            route = data['routes'][0]

            # Make sure coordinates for frontend are [lat, lng]
            route_coords = [[lat, lng] for lng, lat in coords]

            return {
                'distance': route['summary']['distance'] * 0.000621371,  # meters -> miles
                'duration': route['summary']['duration'] / 3600.0,       # seconds -> hours
                'geometry': {
                    'type': 'LineString',
                    'coordinates': route_coords
                },
                'coordinates': route_coords
            }
        return None


    def _geocode_location_ors(self, location):
        """Geocode using ORS"""
        if not ORS_API_KEY:
            return None
        url = "https://api.openrouteservice.org/geocode/search"
        params = {"api_key": ORS_API_KEY, "text": location, "size": 1}
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            features = data.get("features")
            if features:
                # ORS returns [lng, lat]
                return features[0]['geometry']['coordinates']
        return None
        # --- Add this inside your TripViewSet class ---

    def _calculate_trip_legs(self, trip, route_data):
        calculator = HOSCalculator(trip.current_cycle_used)
        start_time = timezone.now()
        current_time = start_time
        trip_legs = []
        leg_order = 0

        # 1 hour on duty to pickup
        trip_legs.append(TripLeg.objects.create(
            trip=trip,
            leg_type='ON_DUTY',
            start_time=current_time,
            end_time=current_time + timedelta(hours=1),
            start_location=trip.current_location,
            end_location=trip.pickup_location,
            duration=1.0,
            order=leg_order,
            start_lat=route_data['coordinates'][0][1],
            start_lng=route_data['coordinates'][0][0]
        ))
        leg_order += 1
        current_time += timedelta(hours=1)

        total_distance = route_data['distance']
        segments = calculator.calculate_driving_segments(total_distance)
        cumulative_distance = 0.0

        for segment in segments:
            duration_hours = segment['duration']
            duration_td = timedelta(hours=duration_hours)
            if segment['type'] == 'DRIVE':
                distance = segment.get('distance', 0)
                cumulative_distance += distance
                end_loc = f"Mile {round(cumulative_distance)}"
            else:
                end_loc = trip_legs[-1].end_location

            TripLeg.objects.create(
                trip=trip,
                leg_type=segment['type'],
                start_time=current_time,
                end_time=current_time + duration_td,
                start_location=trip_legs[-1].end_location,
                end_location=end_loc,
                distance=segment.get('distance', 0),
                duration=duration_hours,
                order=leg_order
            )
            leg_order += 1
            current_time += duration_td

        # Final on-duty to dropoff
        TripLeg.objects.create(
            trip=trip,
            leg_type='ON_DUTY',
            start_time=current_time,
            end_time=current_time + timedelta(hours=1),
            start_location=trip_legs[-1].end_location,
            end_location=trip.dropoff_location,
            duration=1.0,
            order=leg_order,
            end_lat=route_data['coordinates'][-1][1],
            end_lng=route_data['coordinates'][-1][0]
        )

        return trip.legs.all()

    def _generate_daily_logs(self, trip, trip_legs):
        legs_by_date = {}
        for leg in trip_legs:
            date = leg.start_time.date()
            legs_by_date.setdefault(date, []).append(leg)

        daily_logs = []
        day_number = 1
        for date, legs in sorted(legs_by_date.items()):
            grid_data = self._create_grid_data(legs, date)
            total_miles = sum(getattr(leg, 'distance', 0) for leg in legs if leg.leg_type == 'DRIVE')
            total_off_duty = sum(getattr(leg, 'duration', 0) for leg in legs if leg.leg_type == 'OFF_DUTY')
            total_sleeper = sum(getattr(leg, 'duration', 0) for leg in legs if leg.leg_type == 'SLEEPER')
            total_driving = sum(getattr(leg, 'duration', 0) for leg in legs if leg.leg_type == 'DRIVE')
            total_on_duty = sum(getattr(leg, 'duration', 0) for leg in legs if leg.leg_type in ['ON_DUTY', 'FUEL', 'REST'])

            remarks = f"Day {day_number} of trip\n"
            for leg in legs:
                remarks += f"{leg.start_time.strftime('%H:%M')} - {leg.leg_type} at {leg.start_location}\n"

            daily_log = DailyLog.objects.create(
                trip=trip,
                date=date,
                day_number=day_number,
                total_miles=total_miles,
                total_off_duty=total_off_duty,
                total_sleeper=total_sleeper,
                total_driving=total_driving,
                total_on_duty=total_on_duty,
                grid_data=grid_data,
                remarks=remarks.strip()
            )
            daily_logs.append(daily_log)
            day_number += 1

        return daily_logs

    def _create_grid_data(self, legs, date):
        grid = [{'status': 'OFF_DUTY', 'location': ''} for _ in range(96)]
        for leg in legs:
            if leg.start_time.date() != date:
                continue
            start_hour = leg.start_time.hour
            start_minute = leg.start_time.minute
            start_segment = (start_hour * 4) + (start_minute // 15)
            duration_segments = max(1, int(round(leg.duration * 4)))
            status_map = {
                'DRIVE': 'DRIVING',
                'FUEL': 'ON_DUTY',
                'REST': 'OFF_DUTY',
                'SLEEPER': 'SLEEPER',
                'ON_DUTY': 'ON_DUTY',
                'OFF_DUTY': 'OFF_DUTY'
            }
            status = status_map.get(leg.leg_type, 'OFF_DUTY')
            for i in range(duration_segments):
                idx = start_segment + i
                if 0 <= idx < 96:
                    grid[idx] = {'status': status, 'location': leg.start_location}
        return grid

