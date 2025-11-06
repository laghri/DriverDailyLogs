# simple HOS / driving segments helper
from math import floor

class HOSCalculator:
    def __init__(self, cycle_used_hours=0):
        self.cycle_used = cycle_used_hours

    def calculate_driving_segments(self, total_distance_miles):
        """
        Create driving/rest segments based on naive rules:
         - Fuel every 1000 miles (0.5h)
         - 1 hour pick/dropoff on start and end
         - break for sleeper when required (example)
        Returns list of {type, duration, distance}
        """
        segments = []
        remaining = total_distance_miles
        avg_speed = 60.0
        total_driving_hours = total_distance_miles / avg_speed if avg_speed else 0
        max_drive_chunk = 7.0
        fuel_miles = 1000.0
        cumulative_distance = 0.0

        while remaining > 1e-3:
            next_fuel_distance = fuel_miles - (cumulative_distance % fuel_miles)
            dist_for_chunk = min(remaining, next_fuel_distance)
            hours_for_chunk = dist_for_chunk / avg_speed

            # limit chunk to max_drive_chunk
            if hours_for_chunk > max_drive_chunk:
                hours_for_chunk = max_drive_chunk
                dist_for_chunk = hours_for_chunk * avg_speed

            segments.append({
                "type": "DRIVE",
                "duration": round(hours_for_chunk, 2),
                "distance": round(dist_for_chunk, 2)
            })
            remaining -= dist_for_chunk
            cumulative_distance += dist_for_chunk

            # If we still have remaining and we hit a fuel_miles boundary, add FUEL stop
            if cumulative_distance % fuel_miles == 0 or (fuel_miles - (cumulative_distance % fuel_miles)) < 1e-6:
                if remaining > 0:
                    segments.append({"type": "FUEL", "duration": 0.5, "distance": 0})

            # insert a short REST 30min every 8 hours driven aggregated? Keep simple: after every 8 hours driving add REST 0.5h
            driven_hours = sum(s["duration"] for s in segments if s["type"] == "DRIVE")
            if driven_hours >= 8.0:
                segments.append({"type": "REST", "duration": 0.5, "distance": 0})
        
        return segments
