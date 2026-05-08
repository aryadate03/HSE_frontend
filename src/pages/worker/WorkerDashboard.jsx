import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeCard from '../../components/worker/WelcomeCard';
import StatsCards from '../../components/worker/StatsCards';
import SafetyTipsCard from '../../components/worker/SafetyTipsCard';
import ReportDetailsModal from '../../components/worker/ReportDetailsModal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { STATUS_COLORS, STATUS_LABELS, SEVERITY_COLORS, SEVERITY_LABELS } from '../../utils/constants';
import { formatTimeAgo } from '../../utils/formatters';
import incidentService from '../../services/incidentService';
import buddyService from '../../services/buddyService';
import { Eye, Users, Trophy, Flame, CheckCircle, Clock } from 'lucide-react';

// ── Buddy Pair Card ───────────────────────────────────────────────────────────
const BuddyPairCard = ({ onNavigate }) => {
  const [pairData, setPairData]     = useState(null);
  const [scoreData, setScoreData]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed]   = useState(false);

  useEffect(() => { fetchBuddyData(); }, []);

  const fetchBuddyData = async () => {
    try {
      const [pairRes, scoreRes] = await Promise.all([
        buddyService.getMyPair(),
        buddyService.getMyScore(),
      ]);
      setPairData(pairRes.data);
      setScoreData(scoreRes.data);
      setConfirmed(pairRes.data?.myConfirmed || false);
    } catch (err) {
      console.error('Buddy fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!pairData?.pair?._id) return;
    setConfirming(true);
    try {
      await buddyService.confirmVerify(pairData.pair._id, '');
      setConfirmed(true);
      await fetchBuddyData();
    } catch (err) {
      console.error('Confirm error:', err);
    } finally {
      setConfirming(false);
    }
  };

  const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-center h-32">
      <LoadingSpinner size="sm" text="Loading buddy..." />
    </div>
  );

  const pair = pairData?.pair;
  const senior = pair?.seniorWorker;
  const junior = pair?.juniorWorker;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100"
        style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
        <div className="flex items-center gap-2">
          <Users size={18} className="text-yellow-400" />
          <h3 className="font-semibold text-white text-sm">Today's Safety Buddy</h3>
        </div>
        <button onClick={onNavigate} className="text-xs text-yellow-400 hover:text-yellow-300 font-medium">
          View Details →
        </button>
      </div>

      {/* Points bar */}
      {scoreData && (
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          <div className="p-3 text-center">
            <p className="text-lg font-black text-yellow-500">{scoreData.totalCreditPoints ?? 0}</p>
            <p className="text-xs text-gray-400">Total Points</p>
          </div>
          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame size={14} className="text-orange-400" />
              <p className="text-lg font-black text-orange-400">{scoreData.verifyStreak ?? 0}</p>
            </div>
            <p className="text-xs text-gray-400">Day Streak</p>
          </div>
          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Trophy size={14} className="text-blue-400" />
              <p className="text-lg font-black text-blue-400">#{scoreData.rank ?? '—'}</p>
            </div>
            <p className="text-xs text-gray-400">Your Rank</p>
          </div>
        </div>
      )}

      {/* Pair info */}
      {!pair ? (
        <div className="p-6 text-center">
          <Users size={32} className="text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm font-medium">No buddy assigned today</p>
          <p className="text-gray-300 text-xs mt-1">Pairs are created daily by your supervisor</p>
        </div>
      ) : (
        <div className="p-4">

          {/* Task type + status row */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 capitalize">
              🔧 {pair.taskType?.replace(/_/g, ' ')}
            </span>
            {pair.status === 'completed' ? (
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                <CheckCircle size={12} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium">Completed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                <Clock size={12} className="text-yellow-500" />
                <span className="text-xs text-yellow-600 font-medium">Pending</span>
              </div>
            )}
          </div>

          {/* Both workers shown side by side */}
          <div className="flex items-center gap-2 mb-4">

            {/* Senior Worker */}
            <div className={`flex-1 rounded-xl p-3 border-2 ${pairData.myRole === 'senior' ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {getInitials(senior?.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{senior?.name}</p>
                  <p className="text-xs text-gray-400 truncate capitalize">{senior?.department}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  👑 Senior
                </span>
                {pairData.myRole === 'senior' && (
                  <span className="text-xs font-bold text-purple-600">You</span>
                )}
              </div>
              <div className="mt-1">
                {pair.seniorConfirmed
                  ? <span className="text-xs text-green-600">✅ Confirmed</span>
                  : <span className="text-xs text-gray-400">⏳ Not confirmed</span>
                }
              </div>
            </div>

            {/* Connector */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-gray-300 text-lg">↔</span>
            </div>

            {/* Junior Worker */}
            <div className={`flex-1 rounded-xl p-3 border-2 ${pairData.myRole === 'junior' ? 'border-orange-300 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {getInitials(junior?.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{junior?.name}</p>
                  <p className="text-xs text-gray-400 truncate capitalize">{junior?.department}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  📚 Junior
                </span>
                {pairData.myRole === 'junior' && (
                  <span className="text-xs font-bold text-orange-600">You</span>
                )}
              </div>
              <div className="mt-1">
                {pair.juniorConfirmed
                  ? <span className="text-xs text-green-600">✅ Confirmed</span>
                  : <span className="text-xs text-gray-400">⏳ Not confirmed</span>
                }
              </div>
            </div>
          </div>

          {/* Points preview */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">Complete today's verify to earn:</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-black text-yellow-500">+10</span>
              <span className="text-xs text-gray-400">pts</span>
              <span className="text-xs text-green-500 ml-1">+5 if before 9AM</span>
            </div>
          </div>

          {/* Action button */}
          {pair.status === 'completed' ? (
            <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm font-semibold text-green-600">Verify Completed Today!</span>
            </div>
          ) : confirmed ? (
            <div className="flex items-center justify-center gap-2 py-2 bg-blue-50 rounded-lg">
              <CheckCircle size={16} className="text-blue-500" />
              <span className="text-sm font-semibold text-blue-600">Waiting for buddy to confirm...</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: confirming ? '#94a3b8' : '#10b981' }}
              >
                {confirming
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Confirming...</>
                  : <><CheckCircle size={15} /> Accept & Confirm Buddy</>
                }
              </button>
              <button
                onClick={onNavigate}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Checklist
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [selectedIncident, setSelected] = useState(null);
  const [error, setError]               = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await incidentService.getDashboard();
        setDashboard(res.data);
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading dashboard..." />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">

      <WelcomeCard onReportClick={() => navigate('/worker/report')} />

      <StatsCards stats={dashboard?.stats} />

      {/* Buddy Pair Card */}
      <BuddyPairCard onNavigate={() => navigate('/worker/buddy')} />

      <SafetyTipsCard />

      {/* Recent Reports */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-800">Recent Reports</h3>
          <button onClick={() => navigate('/worker/reports')} className="text-sm text-blue-600 hover:underline">
            View All
          </button>
        </div>

        {error && (
          <div className="p-6 text-center text-red-500 text-sm">{error}</div>
        )}

        {!error && (!dashboard?.recentReports || dashboard.recentReports.length === 0) && (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm">No reports yet.</p>
            <button onClick={() => navigate('/worker/report')}
              className="mt-2 text-sm text-blue-600 hover:underline">
              Create your first report
            </button>
          </div>
        )}

        {!error && dashboard?.recentReports?.length > 0 && (
          <div className="divide-y divide-gray-50">
            {dashboard.recentReports.map((report) => (
              <div key={report._id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-800">{report.incidentId}</span>
                    <Badge label={SEVERITY_LABELS[report.severity]} colorClass={SEVERITY_COLORS[report.severity]} />
                    <Badge label={STATUS_LABELS[report.status]} colorClass={STATUS_COLORS[report.status]} />
                  </div>
                  <span className="text-xs text-gray-400">{formatTimeAgo(report.createdAt)}</span>
                </div>
                <button onClick={() => setSelected(report)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Eye size={16} className="text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportDetailsModal
        isOpen={!!selectedIncident}
        onClose={() => setSelected(null)}
        incident={selectedIncident}
      />
    </div>
  );
};

export default WorkerDashboard;