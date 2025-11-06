import React from 'react';
import { getStatusColor } from './helpers';

export default function ELDGrid({ gridData }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div>
      <div className="flex mb-2">
        <div className="w-28"></div>
        <div className="flex flex-1">
          {hours.map(hour => (
            <div key={hour} className="flex-1 text-[9px] text-center font-bold text-gray-600">
              {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour-12}p`}
            </div>
          ))}
        </div>
      </div>

      {['OFF_DUTY', 'SLEEPER', 'DRIVING', 'ON_DUTY'].map((status) => (
        <div key={status} className="flex mb-1">
          <div className="w-28 text-[10px] font-bold text-gray-700 flex items-center pr-2">
            {status.replace('_', ' ')}
          </div>
          <div className="flex flex-1 border-2 border-gray-600 rounded" style={{ height: '32px' }}>
            {gridData?.map((segment, idx) => {
              const isActive = segment?.status === status;
              return (
                <div key={idx} className={`flex-1 ${isActive ? getStatusColor(status) : 'bg-white'}`}
                  style={{ borderRight: idx % 4 === 3 ? '1px solid #6b7280' : '1px solid #e5e7eb' }} />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
