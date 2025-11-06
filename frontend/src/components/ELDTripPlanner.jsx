import React, { useState } from 'react';
import { MapPin, Truck, Clock, Calendar, Download } from 'lucide-react';
import { calculateTrip } from '../api/tripService';
import TripSummary from './TripSummary';
import MapView from './MapView';
import DailyLogs from './DailyLogs';

export default function ELDTripPlanner() {
  const [formData, setFormData] = useState({
    currentLocation: 'Los Angeles, CA',
    pickupLocation: 'Phoenix, AZ',
    dropoffLocation: 'Dallas, TX',
    currentCycleUsed: 0
  });
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        current_location: formData.currentLocation,
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation,
        current_cycle_used: parseFloat(formData.currentCycleUsed) || 0
      };
    
      const data = await calculateTrip(payload);
      setTripData(data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || 'API Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ELD Trip Planner</h1>
              <p className="text-sm text-gray-600">FMCSA HOS Compliant Route Planning</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Trip Details
          </h2>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Location</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  value={formData.currentLocation}
                  onChange={(e) => setFormData({...formData, currentLocation: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Location</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dropoff Location</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  value={formData.dropoffLocation}
                  onChange={(e) => setFormData({...formData, dropoffLocation: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Cycle Hours Used (70hr/8day)</label>
                <input type="number" min="0" max="70" step="0.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  value={formData.currentCycleUsed}
                  onChange={(e) => setFormData({...formData, currentCycleUsed: e.target.value})}
                />
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

            <button onClick={handleCalculate} disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg shadow-lg disabled:opacity-50">
              {loading ? 'Calculating Route...' : 'Calculate HOS-Compliant Trip'}
            </button>
          </div>
        </div>

        {tripData && (
          <>
            <TripSummary trip={tripData} />
            <MapView trip={tripData} />
            <DailyLogs logs={tripData.daily_logs || []} />
          </>
        )}
      </div>
    </div>
  );
}
