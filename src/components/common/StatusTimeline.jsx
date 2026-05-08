import { formatDateTime } from '../../utils/formatters';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';
import { CheckCircle, Clock } from 'lucide-react';

const STATUS_ORDER = ['draft', 'submitted', 'under_review', 'assigned', 'investigating', 'resolved', 'closed'];

const StatusTimeline = ({ currentStatus, createdAt, updatedAt }) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="flex flex-col gap-3">
      {STATUS_ORDER.map((status, index) => {
        const isDone = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={status} className="flex items-start gap-3">
            {/* Icon */}
            <div className={`mt-0.5 rounded-full p-1 shrink-0 ${isDone ? 'text-blue-600' : 'text-gray-300'}`}>
              {isDone ? <CheckCircle size={18} /> : <Clock size={18} />}
            </div>

            {/* Label */}
            <div>
              <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                {STATUS_LABELS[status]}
              </p>
              {isCurrent && updatedAt && (
                <p className="text-xs text-gray-400">{formatDateTime(updatedAt)}</p>
              )}
              {status === 'draft' && createdAt && (
                <p className="text-xs text-gray-400">{formatDateTime(createdAt)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;