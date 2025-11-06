import React from 'react';
import ELDGrid from './ELDGrid';

export default function ELDLogSheet({ log }) {
  return (
    <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-800 text-white p-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-bold mb-1">Date:</div>
            <div>{log.date}</div>
          </div>
          <div>
            <div className="font-bold mb-1">Total Miles:</div>
            <div>{log.total_miles} miles</div>
          </div>
          <div>
            <div className="font-bold mb-1">Day:</div>
            <div>Day {log.day_number}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6">
        <ELDGrid gridData={log.grid_data} />
      </div>

      <div className="bg-gray-50 p-4 border-t-2 border-gray-800">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">OFF DUTY</div>
            <div className="text-2xl font-bold text-gray-900">{(log.total_off_duty||0).toFixed(1)}h</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">SLEEPER</div>
            <div className="text-2xl font-bold text-blue-600">{(log.total_sleeper||0).toFixed(1)}h</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">DRIVING</div>
            <div className="text-2xl font-bold text-green-600">{(log.total_driving||0).toFixed(1)}h</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">ON DUTY</div>
            <div className="text-2xl font-bold text-orange-600">{(log.total_on_duty||0).toFixed(1)}h</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 border-t border-gray-300">
        <div className="font-bold text-sm text-gray-700 mb-2">REMARKS:</div>
        <div className="text-sm text-gray-600 whitespace-pre-line">{log.remarks}</div>
      </div>
    </div>
  );
}
