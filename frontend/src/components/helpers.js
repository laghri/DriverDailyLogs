export function getLegColor(type) {
  const colors = {
    'DRIVE': 'bg-green-500',
    'FUEL': 'bg-yellow-500',
    'REST': 'bg-blue-500',
    'SLEEPER': 'bg-purple-500',
    'ON_DUTY': 'bg-orange-500',
    'OFF_DUTY': 'bg-gray-400'
  };
  return colors[type] || 'bg-gray-400';
}

export function getLegLabel(type) {
  const labels = {
    'DRIVE': 'Driving',
    'FUEL': 'Fuel Stop',
    'REST': '30-Min Rest Break',
    'SLEEPER': '10-Hr Sleeper Berth',
    'ON_DUTY': 'On Duty (Not Driving)',
    'OFF_DUTY': 'Off Duty'
  };
  return labels[type] || type;
}

export function getStatusColor(status) {
  const colors = {
    'OFF_DUTY': 'bg-gray-300',
    'SLEEPER': 'bg-blue-400',
    'DRIVING': 'bg-green-400',
    'ON_DUTY': 'bg-orange-400'
  };
  return colors[status] || 'bg-gray-200';
}
