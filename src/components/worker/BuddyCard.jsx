import { Users, CheckCircle, ShieldCheck, ClipboardList } from 'lucide-react';

const TASK_LABELS = {
  scaffolding:       '🏗️ Scaffolding',
  electrical:        '⚡ Electrical',
  excavation:        '⛏️ Excavation',
  welding:           '🔥 Welding',
  heavy_machinery:   '🚜 Heavy Machinery',
  chemical_handling: '⚗️ Chemical Handling',
  general:           '🔧 General Work',
};

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const BuddyCard = ({ pair, buddy, myRole, myConfirmed, onStartVerify, onOpenChecklist }) => {
  if (!pair || !buddy) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
        <Users size={36} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No buddy assigned today</p>
        <p className="text-xs text-gray-400 mt-1">Your supervisor will create pairs for today's tasks</p>
      </div>
    );
  }

  const STATUS_INFO = {
    pending:     { label: 'Pending',      color: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: 'In Progress',  color: 'bg-blue-100 text-blue-700'    },
    completed:   { label: 'Completed ✅', color: 'bg-green-100 text-green-700'  },
    skipped:     { label: 'Skipped',      color: 'bg-red-100 text-red-700'      },
  };

  const statusInfo = STATUS_INFO[pair.status] || STATUS_INFO.pending;
  const iAmSenior  = myRole === 'senior';
  const senior     = pair.seniorWorker;
  const junior     = pair.juniorWorker;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span className="font-semibold">Today's Safety Buddy Pair</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-blue-100 text-xs">{TASK_LABELS[pair.taskType]}</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold">
            {iAmSenior ? '👑 You are Senior' : '📚 You are Junior'}
          </span>
        </div>
      </div>

      <div className="p-4">

        {/* Both workers side by side */}
        <div className="flex items-stretch gap-2 mb-4">

          {/* Senior Worker */}
          <div className={`flex-1 rounded-xl p-3 border-2 ${iAmSenior ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {getInitials(senior?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{senior?.name}</p>
                <p className="text-xs text-gray-400 truncate capitalize">{senior?.department}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                👑 Senior
              </span>
              {iAmSenior && (
                <span className="text-xs font-bold text-purple-700 bg-purple-200 px-2 py-0.5 rounded-full">You</span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ShieldCheck size={11} className="text-blue-400" />
              <span className="text-xs text-gray-500">Score: <strong>{senior?.safetyScore}</strong></span>
            </div>
            <div className="mt-1">
              {pair.seniorConfirmed
                ? <span className="text-xs text-green-600">✅ Confirmed</span>
                : <span className="text-xs text-gray-400">⏳ Pending</span>
              }
            </div>
          </div>

          {/* Connector */}
          <div className="flex items-center justify-center shrink-0 px-1">
            <span className="text-gray-300 text-xl">↔</span>
          </div>

          {/* Junior Worker */}
          <div className={`flex-1 rounded-xl p-3 border-2 ${!iAmSenior ? 'border-orange-300 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {getInitials(junior?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{junior?.name}</p>
                <p className="text-xs text-gray-400 truncate capitalize">{junior?.department}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                📚 Junior
              </span>
              {!iAmSenior && (
                <span className="text-xs font-bold text-orange-700 bg-orange-200 px-2 py-0.5 rounded-full">You</span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ShieldCheck size={11} className="text-blue-400" />
              <span className="text-xs text-gray-500">Score: <strong>{junior?.safetyScore}</strong></span>
            </div>
            <div className="mt-1">
              {pair.juniorConfirmed
                ? <span className="text-xs text-green-600">✅ Confirmed</span>
                : <span className="text-xs text-gray-400">⏳ Pending</span>
              }
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {pair.status === 'completed' ? (
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-green-50 rounded-lg text-center">
              <p className="text-green-700 text-sm font-semibold">✅ Joint Safety Verify Complete!</p>
              <p className="text-green-600 text-xs mt-0.5">Both confirmed • Safety score updated</p>
            </div>
            {/* Checklist always visible even when completed */}
            {onOpenChecklist && (
              <button
                onClick={onOpenChecklist}
                className="flex items-center gap-1.5 px-4 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ClipboardList size={15} />
                Checklist
              </button>
            )}
          </div>
        ) : myConfirmed ? (
          <div className="flex gap-2">
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 rounded-lg">
              <CheckCircle size={15} className="text-blue-500" />
              <span className="text-sm font-semibold text-blue-600">Waiting for buddy to confirm...</span>
            </div>
            {onOpenChecklist && (
              <button
                onClick={onOpenChecklist}
                className="flex items-center gap-1.5 px-4 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ClipboardList size={15} />
                Checklist
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onStartVerify}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              🚀 Start Joint Safety Verify
            </button>
            {onOpenChecklist && (
              <button
                onClick={onOpenChecklist}
                className="flex items-center gap-1.5 px-4 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ClipboardList size={15} />
                Checklist
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default BuddyCard;