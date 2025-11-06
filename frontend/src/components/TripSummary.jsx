import React from 'react';
import { getLegColor, getLegLabel } from './helpers';

export default function TripSummary({ trip }) {
  const legs = trip.legs || [];
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Trip Summary</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="text-blue-600 font-semibold mb-2">Total Distance</div>
          <div className="text-3xl font-bold text-gray-900">{(trip.total_distance || 0).toFixed(0)} mi</div>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="text-green-600 font-semibold mb-2">Estimated Duration</div>
          <div className="text-3xl font-bold text-gray-900">{((trip.total_duration||0)).toFixed(1)} hrs</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <div className="text-purple-600 font-semibold mb-2">Total Days</div>
          <div className="text-3xl font-bold text-gray-900">{(trip.daily_logs || []).length}</div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Trip Breakdown</h3>
        <div className="space-y-3">
          {legs.map((leg, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className={`w-3 h-3 rounded-full ${getLegColor(leg.leg_type)}`} />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{getLegLabel(leg.leg_type)}</div>
                <div className="text-sm text-gray-600">{leg.start_location}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{(leg.duration||0).toFixed(2)}h</div>
                {leg.distance > 0 && <div className="text-sm text-gray-600">{leg.distance} mi</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
