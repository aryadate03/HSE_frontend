import { ShieldCheck, Flame, Trophy, TrendingUp } from 'lucide-react';

const getScoreColor = (score) => {
  if (score >= 80) return { ring: '#22c55e', bg: 'bg-green-50', text: 'text-green-700', label: 'Excellent' };
  if (score >= 60) return { ring: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700', label: 'Good' };
  if (score >= 40) return { ring: '#f59e0b', bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Fair' };
  return { ring: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', label: 'Needs Improvement' };
};

const LEVEL_COLORS = {
  junior: 'bg-gray-100 text-gray-600',
  mid: 'bg-blue-100 text-blue-700',
  senior: 'bg-purple-100 text-purple-700',
  expert: 'bg-yellow-100 text-yellow-700',
};

const SafetyScoreCard = ({ scoreData }) => {
  if (!scoreData) return null;

  const { safetyScore, verifyStreak, totalVerifies, skippedVerifies, experienceLevel, percentile, rank, totalWorkers } = scoreData;
  const color = getScoreColor(safetyScore);

  // SVG ring calculation
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = (safetyScore / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={18} className="text-blue-600" />
        <h3 className="font-semibold text-gray-800">My Safety Score</h3>
        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full capitalize ${LEVEL_COLORS[experienceLevel]}`}>
          {experienceLevel}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Ring */}
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={color.ring}
              strokeWidth="10"
              strokeDasharray={`${progress} ${circumference}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{safetyScore}</span>
            <span className={`text-xs font-medium ${color.text}`}>{color.label}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-500" />
            <span className="text-sm text-gray-600">Streak</span>
            <span className="ml-auto font-bold text-gray-800">{verifyStreak} days</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-500" />
            <span className="text-sm text-gray-600">Completed</span>
            <span className="ml-auto font-bold text-gray-800">{totalVerifies}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            <span className="text-sm text-gray-600">Skipped</span>
            <span className="ml-auto font-bold text-red-500">{skippedVerifies}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-sm text-gray-600">Rank</span>
            <span className="ml-auto font-bold text-gray-800">#{rank} of {totalWorkers}</span>
          </div>
        </div>
      </div>

      {/* Percentile bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Better than</span>
          <span className={`font-semibold ${color.text}`}>{percentile}% of workers</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${percentile}%`, backgroundColor: color.ring }}
          />
        </div>
      </div>
    </div>
  );
};

export default SafetyScoreCard;