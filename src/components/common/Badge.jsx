const Badge = ({ label, colorClass = 'bg-gray-100 text-gray-600', className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
    {label}
  </span>
);

export const StatusBadge = ({ status }) => {
  const map = {
    new:        'bg-blue-100 text-blue-700',
    pending:    'bg-yellow-100 text-yellow-700',
    reviewed:   'bg-green-100 text-green-700',
    escalated:  'bg-orange-100 text-orange-700',
    rejected:   'bg-red-100 text-red-700',
    resolved:   'bg-emerald-100 text-emerald-700',
  };
  return <Badge label={status} colorClass={map[status] || 'bg-gray-100 text-gray-600'} />;
};

export const PriorityBadge = ({ priority }) => {
  const map = {
    critical: 'bg-red-100 text-red-700',
    high:     'bg-orange-100 text-orange-700',
    medium:   'bg-blue-100 text-blue-700',
    low:      'bg-gray-100 text-gray-600',
  };
  return <Badge label={priority} colorClass={map[priority] || 'bg-gray-100 text-gray-600'} />;
};

export default Badge;