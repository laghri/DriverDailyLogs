import React, { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import ELDLogSheet from './ELDLogSheet';

export default function DailyLogs({ logs }) {
  const [selected, setSelected] = useState(0);
  const currentLog = logs[selected];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          ELD Daily Logs
        </h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {logs.map((log, idx) => (
          <button key={idx} onClick={() => setSelected(idx)}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${selected===idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            Day {log.day_number}
          </button>
        ))}
      </div>

      {currentLog ? <ELDLogSheet log={currentLog} /> : <div>No logs yet</div>}
    </div>
  );
}
