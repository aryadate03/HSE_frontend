import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import buddyService from '../../services/buddyService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Trophy, Flame, Star, Crown } from 'lucide-react';

const LEVEL_COLORS = {
  junior: 'bg-gray-700 text-gray-300',
  mid:    'bg-blue-900 text-blue-300',
  senior: 'bg-purple-900 text-purple-300',
  expert: 'bg-yellow-900 text-yellow-300',
};

const getRankStyle = (rank) => {
  if (rank === 1) return 'bg-yellow-400 text-gray-900 font-black';
  if (rank === 2) return 'bg-gray-300 text-gray-900 font-black';
  if (rank === 3) return 'bg-orange-400 text-gray-900 font-black';
  return 'bg-gray-800 text-gray-400 font-bold';
};

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [type, setType]               = useState('monthly');
  const [error, setError]             = useState('');

  useEffect(() => { fetchLeaderboard(); }, [type]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await buddyService.getLeaderboard(type);
      setLeaderboard(res.data.leaderboard || []);
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const myEntry = leaderboard.find((e) => e.name === user?.name);

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-5 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-yellow-400 p-2 rounded-xl">
          <Trophy size={22} className="text-gray-900" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Leaderboard</h1>
          <p className="text-xs text-gray-400">Top safety performers on site</p>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex bg-gray-800 rounded-xl p-1 gap-1">
        {[
          { value: 'weekly',    label: 'This Week' },
          { value: 'monthly',   label: 'This Month' },
          { value: 'all_time',  label: 'All Time' },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors
              ${type === t.value ? 'bg-yellow-400 text-gray-900' : 'text-gray-400 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* My rank banner */}
      {myEntry && (
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 text-xs font-black">
              {getInitials(myEntry.name)}
            </div>
            <div>
              <p className="text-sm font-bold text-white">Your Rank</p>
              <p className="text-xs text-gray-400">{myEntry.points} points this period</p>
            </div>
          </div>
          <div className="text-3xl font-black text-yellow-400">#{myEntry.rank}</div>
        </div>
      )}

      {/* Top 3 podium */}
      {!loading && leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-4">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-900 font-black text-sm">
              {getInitials(leaderboard[1]?.name)}
            </div>
            <p className="text-xs text-gray-300 font-medium text-center w-16 truncate">{leaderboard[1]?.name}</p>
            <div className="bg-gray-500 w-16 h-16 rounded-t-xl flex flex-col items-center justify-center">
              <span className="text-white font-black text-lg">2</span>
              <span className="text-gray-300 text-xs">{leaderboard[1]?.points}pts</span>
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2">
            <Crown size={20} className="text-yellow-400" />
            <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-black text-sm">
              {getInitials(leaderboard[0]?.name)}
            </div>
            <p className="text-xs text-yellow-300 font-bold text-center w-16 truncate">{leaderboard[0]?.name}</p>
            <div className="bg-yellow-400 w-16 h-24 rounded-t-xl flex flex-col items-center justify-center">
              <span className="text-gray-900 font-black text-xl">1</span>
              <span className="text-gray-800 text-xs">{leaderboard[0]?.points}pts</span>
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center text-gray-900 font-black text-sm">
              {getInitials(leaderboard[2]?.name)}
            </div>
            <p className="text-xs text-gray-300 font-medium text-center w-16 truncate">{leaderboard[2]?.name}</p>
            <div className="bg-orange-600 w-16 h-12 rounded-t-xl flex flex-col items-center justify-center">
              <span className="text-white font-black text-lg">3</span>
              <span className="text-orange-200 text-xs">{leaderboard[2]?.points}pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" text="Loading rankings..." />
        </div>
      ) : (
        <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No data yet — complete verifies to earn points!</div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-4 p-4 ${entry.name === user?.name ? 'bg-yellow-400/5' : 'hover:bg-white/5'}`}
                >
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${getRankStyle(entry.rank)}`}>
                    {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : entry.rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(entry.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-bold ${entry.name === user?.name ? 'text-yellow-400' : 'text-white'}`}>
                        {entry.name} {entry.name === user?.name && '(You)'}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${LEVEL_COLORS[entry.experienceLevel]}`}>
                        {entry.experienceLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">{entry.department}</span>
                      {entry.streak > 0 && (
                        <div className="flex items-center gap-1">
                          <Flame size={10} className="text-orange-400" />
                          <span className="text-xs text-orange-400">{entry.streak}d</span>
                        </div>
                      )}
                      {entry.badges?.slice(0, 3).map((b, i) => (
                        <span key={i} className="text-xs" title={b.name}>{b.icon}</span>
                      ))}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-yellow-400">{entry.points}</p>
                    <p className="text-xs text-gray-500">pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;