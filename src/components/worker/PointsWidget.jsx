import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import buddyService from '../../services/buddyService';
import { Star, Flame, Trophy, ChevronRight } from 'lucide-react';

const PointsWidget = () => {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buddyService.getMyScore()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 animate-pulse h-32" />
    );
  }

  if (!data) return null;

  return (
    <div
      className="bg-gray-900 border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-yellow-400/30 transition-colors"
      onClick={() => navigate('/worker/buddy')}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400/20 p-1.5 rounded-lg">
            <Star size={16} className="text-yellow-400" />
          </div>
          <span className="text-sm font-bold text-white">Credit Points</span>
        </div>
        <ChevronRight size={16} className="text-gray-500" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xl font-black text-yellow-400">{data.totalCreditPoints ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total</p>
        </div>
        <div className="text-center border-x border-white/10">
          <div className="flex items-center justify-center gap-1">
            <Flame size={14} className="text-orange-400" />
            <p className="text-2xl font-black text-orange-400">{data.verifyStreak ?? 0}</p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Streak</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Trophy size={14} className="text-blue-400" />
            <p className="text-2xl font-black text-blue-400">#{data.rank ?? '-'}</p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Rank</p>
        </div>
      </div>

      {/* Badges row */}
      {data.badges?.length > 0 && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/10">
          <span className="text-xs text-gray-500 mr-1">Badges:</span>
          {data.badges.slice(0, 5).map((b, i) => (
            <span key={i} title={b.name} className="text-base">{b.icon}</span>
          ))}
          {data.badges.length > 5 && (
            <span className="text-xs text-gray-500">+{data.badges.length - 5}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default PointsWidget;