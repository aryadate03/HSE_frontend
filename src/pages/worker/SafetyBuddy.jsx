import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BuddyCard from '../../components/worker/BuddyCard';
import SafetyScoreCard from '../../components/worker/SafetyScoreCard';
import VerifyChecklistModal from '../../components/worker/VerifyChecklistModal';
import BadgesSection from '../../components/worker/BadgesSection';
import buddyService from '../../services/buddyService';
import { formatDate } from '../../utils/formatters';
import { CheckCircle, XCircle, Clock, History, Trophy } from 'lucide-react';

const STATUS_ICON = {
  completed:   <CheckCircle size={14} className="text-green-400" />,
  pending:     <Clock size={14} className="text-yellow-400" />,
  in_progress: <Clock size={14} className="text-blue-400" />,
  skipped:     <XCircle size={14} className="text-red-400" />,
};

const SafetyBuddy = () => {
  const navigate = useNavigate();
  const [pairData, setPairData]     = useState(null);
  const [scoreData, setScoreData]   = useState(null);
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showVerify, setShowVerify] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pairRes, scoreRes, historyRes] = await Promise.all([
        buddyService.getMyPair(),
        buddyService.getMyScore(),
        buddyService.getHistory({ page: 1, limit: 5 }),
      ]);
      setPairData(pairRes.data);
      setScoreData(scoreRes.data);
      setHistory(historyRes.data.history || []);
    } catch (err) {
      setError('Failed to load buddy data');
    } finally {
      setLoading(false);
    }
  };

  // Close modal first, THEN refresh data
  const handleVerifyCompleted = async () => {
    setShowVerify(false);
    await fetchAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading safety buddy..." />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-5 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Safety Buddy</h1>
          <p className="text-sm text-gray-400 mt-0.5">Peer-to-peer safety accountability</p>
        </div>
        <button
          onClick={() => navigate('/worker/leaderboard')}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-xl text-yellow-400 text-sm font-semibold hover:bg-yellow-400/20 transition-colors"
        >
          <Trophy size={16} /> Leaderboard
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Points summary */}
      {scoreData && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-yellow-400">{scoreData.totalCreditPoints ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Total Points</p>
          </div>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-orange-400">{scoreData.weeklyPoints ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">This Week</p>
          </div>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-blue-400">#{scoreData.rank ?? '-'}</p>
            <p className="text-xs text-gray-400 mt-1">Your Rank</p>
          </div>
        </div>
      )}

      {/* Today's Buddy */}
      <BuddyCard
        pair={pairData?.pair}
        buddy={pairData?.buddy}
        myRole={pairData?.myRole}
        myConfirmed={pairData?.myConfirmed}
        onStartVerify={() => setShowVerify(true)}
        onOpenChecklist={() => setShowVerify(true)}
      />

      {/* Safety Score */}
      <SafetyScoreCard scoreData={scoreData} />

      {/* Badges */}
      <BadgesSection earnedBadges={scoreData?.badges || []} />

      {/* Recent History */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <History size={16} className="text-gray-400" />
          <h3 className="font-bold text-white">Recent Verifies</h3>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No history yet</div>
        ) : (
          <div className="divide-y divide-white/5">
            {history.map((h) => {
              const isSenior = h.seniorWorker?._id === pairData?.pair?.seniorWorker?._id;
              const buddy = isSenior ? h.juniorWorker : h.seniorWorker;
              return (
                <div key={h._id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
                      {buddy?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{buddy?.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(h.pairedDate)} • {h.taskType?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {STATUS_ICON[h.status]}
                    <span className="text-xs text-gray-400 capitalize">{h.status?.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Verify / Checklist Modal */}
      {pairData?.pair && (
        <VerifyChecklistModal
          isOpen={showVerify}
          onClose={() => setShowVerify(false)}
          pair={pairData.pair}
          onCompleted={handleVerifyCompleted}
        />
      )}
    </div>
  );
};

export default SafetyBuddy;