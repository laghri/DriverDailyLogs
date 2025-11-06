# Driver Daily Logs

A full-stack application that generates ELD (Electronic Logging Device) logs and route planning for commercial truck drivers based on FMCSA Hours of Service regulations.

## Features

- **Route Planning**: Input current location, pickup, and drop-off locations to get optimized routes
- **HOS Compliance**: Automatically calculates driving windows, rest breaks, and duty limits based on 70-hour/8-day cycle
- **ELD Log Generation**: Creates accurate daily log sheets with visual grid representation
- **Interactive Map**: Displays route with planned stops for fueling and mandatory rest breaks
- **Real-time Calculations**: Shows available driving hours and schedules breaks according to regulations

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons
- **Backend**: Django, Django REST Framework
- **APIs**: Google Maps API for routing and geocoding
- **Deployment**: Vercel

## Live Demo

Visit the live application: [https://driver-daily-logs.vercel.app/](https://driver-daily-logs.vercel.app/)

## Assumptions

- Property-carrying driver under 70-hour/8-day rule
- No adverse driving conditions
- Fueling stop every 1,000 miles (15 minutes)
- 1 hour each for pickup and drop-off
- Complies with FMCSA HOS regulations (11-hour driving limit, 14-hour window, 30-minute break, 10-hour rest period)

## Usage

1. Enter your current location
2. Enter pickup location
3. Enter drop-off location
4. Input hours already used in current cycle
5. Click "Calculate Route" to generate:
   - Visual route map with planned stops
   - Complete ELD daily log sheets
   - Detailed timeline of trip segments
