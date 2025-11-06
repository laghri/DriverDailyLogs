from django.db import models

class Trip(models.Model):
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    current_cycle_used = models.FloatField(default=0)
    total_distance = models.FloatField(null=True, blank=True)
    total_duration = models.FloatField(null=True, blank=True)
    route_geometry = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class TripLeg(models.Model):
    trip = models.ForeignKey(Trip, related_name='legs', on_delete=models.CASCADE)
    leg_type = models.CharField(max_length=50)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    start_location = models.CharField(max_length=255)
    end_location = models.CharField(max_length=255, blank=True)
    distance = models.FloatField(default=0)
    duration = models.FloatField(default=0)
    order = models.IntegerField(default=0)
    start_lat = models.FloatField(null=True, blank=True)
    start_lng = models.FloatField(null=True, blank=True)
    end_lat = models.FloatField(null=True, blank=True)
    end_lng = models.FloatField(null=True, blank=True)

class DailyLog(models.Model):
    trip = models.ForeignKey(Trip, related_name='daily_logs', on_delete=models.CASCADE)
    date = models.DateField()
    day_number = models.IntegerField()
    total_miles = models.FloatField(default=0)
    total_off_duty = models.FloatField(default=0)
    total_sleeper = models.FloatField(default=0)
    total_driving = models.FloatField(default=0)
    total_on_duty = models.FloatField(default=0)
    grid_data = models.JSONField()
    remarks = models.TextField(blank=True)
