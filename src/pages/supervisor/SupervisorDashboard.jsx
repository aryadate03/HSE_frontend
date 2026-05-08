import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Legend,
} from 'recharts';
import { supervisorAPI } from '../../services/api';
import api from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#06b6d4'];

const TASK_TYPES = [
  { value: 'general',          label: '🔧 General' },
  { value: 'scaffolding',      label: '🏗️ Scaffolding' },
  { value: 'electrical',       label: '⚡ Electrical' },
  { value: 'excavation',       label: '⛏️ Excavation' },
  { value: 'welding',          label: '🔥 Welding' },
  { value: 'heavy_machinery',  label: '🚜 Heavy Machinery' },
  { value: 'chemical_handling',label: '⚗️ Chemical Handling' },
];

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, borderColor, iconBg, sub }) => (
  <div style={{
    background: 'white', borderRadius: '16px', padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${borderColor}`,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  }}>
    <div>
      <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px', fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: '32px', fontWeight: '800', color: borderColor, margin: 0 }}>{value ?? 0}</p>
      {sub && <p style={{ color: '#94a3b8', fontSize: '11px', margin: '4px 0 0' }}>{sub}</p>}
    </div>
    <div style={{ background: iconBg, borderRadius: '12px', padding: '12px', fontSize: '22px' }}>{icon}</div>
  </div>
);

// ── Buddy Pairs Panel ─────────────────────────────────────────────────────────
const BuddyPairsPanel = () => {
  const toast = useToast();
  const [pairsData, setPairsData]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [creating, setCreating]     = useState(false);
  const [taskType, setTaskType]     = useState('general');
  const [alreadyCreated, setAlreadyCreated] = useState(false);

  useEffect(() => { fetchTodayPairs(); }, []);

  const fetchTodayPairs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/buddy/today');
      setPairsData(data.data);
      setAlreadyCreated((data.data?.stats?.total || 0) > 0);
    } catch (err) {
      console.error('Buddy pairs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePairs = async () => {
    setCreating(true);
    try {
      const { data } = await api.post('/buddy/create-pairs', { taskType });
     toast.success(`✅ ${data.data?.totalPairs || data.data?.pairs?.length || 0} buddy pairs created for today!`);
      await fetchTodayPairs();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create pairs.';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '24px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🤝</span>
          <div>
            <h3 style={{ color: 'white', margin: 0, fontSize: 15, fontWeight: 700 }}>Safety Buddy Pairs</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: 12 }}>Daily peer-to-peer safety accountability</p>
          </div>
        </div>
        {/* Stats badges */}
        {pairsData?.stats && (
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Total',     value: pairsData.stats.total,      color: '#3b82f6' },
              { label: 'Done',      value: pairsData.stats.completed,  color: '#22c55e' },
              { label: 'Pending',   value: pairsData.stats.pending,    color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 12px', textAlign: 'center' }}>
                <p style={{ color: s.color, fontWeight: 800, fontSize: 16, margin: 0 }}>{s.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Loading pairs...</div>
        ) : alreadyCreated ? (
          <>
            {/* Already created — show pairs list */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✅</span>
              <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 13, margin: 0 }}>
                Today's pairs have been created — {pairsData?.stats?.total} pairs active
              </p>
            </div>
            {/* Pairs list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {(pairsData?.pairs || []).map((pair, i) => (
                <div key={pair._id || i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#f8fafc', borderRadius: 10, padding: '10px 14px',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Senior */}
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>
                      {pair.seniorWorker?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{pair.seniorWorker?.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Senior · {pair.seniorWorker?.department || '—'}</p>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: 16 }}>↔</span>
                    {/* Junior */}
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>
                      {pair.juniorWorker?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{pair.juniorWorker?.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Junior · {pair.juniorWorker?.department || '—'}</p>
                    </div>
                  </div>
                  {/* Status */}
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: pair.status === 'completed' ? '#f0fdf4' : pair.status === 'in_progress' ? '#eff6ff' : '#fefce8',
                    color: pair.status === 'completed' ? '#16a34a' : pair.status === 'in_progress' ? '#3b82f6' : '#ca8a04',
                  }}>
                    {pair.status === 'completed' ? '✅ Done' : pair.status === 'in_progress' ? '🔄 In Progress' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Not created yet — show create form */
          <div>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 16px' }}>
              No pairs created for today. Select a task type and create pairs for your workers.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={taskType}
                onChange={e => setTaskType(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', background: 'white', flex: 1, minWidth: 200 }}
              >
                {TASK_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <button
                onClick={handleCreatePairs}
                disabled={creating}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: creating ? '#94a3b8' : '#3b82f6', color: 'white',
                  fontSize: 14, fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer',
                }}
              >
                {creating
                  ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Creating...</>
                  : <>🤝 Create Today's Pairs</>
                }
              </button>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const SupervisorDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const { error: toastError } = useToast();
  const { user }              = useAuth();
  const navigate              = useNavigate();

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const { data: res } = await supervisorAPI.getDashboard();
      setData(res.data);
    } catch {
      toastError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader size="lg" text="Loading dashboard…" />
    </div>
  );

  const { summary, priorities, recentIncidents, charts, myStats } = data || {};

  const pieData = [
    { name: 'New',      value: summary?.new      || 0 },
    { name: 'Pending',  value: summary?.pending   || 0 },
    { name: 'Reviewed', value: summary?.reviewed  || 0 },
    { name: 'Escalated',value: summary?.escalated || 0 },
    { name: 'Rejected', value: summary?.rejected  || 0 },
    { name: 'Resolved', value: summary?.resolved  || 0 },
  ].filter(d => d.value > 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

      {/* Blue Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px', fontSize: '18px' }}>🛡️</div>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '700' }}>HSE System</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '12px' }}>Supervisor Portal</p>
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>
          👤 {user?.name || 'Supervisor'}
        </div>
      </div>

      <div style={{ padding: '28px 32px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>
            Good {greeting}, {user?.name?.split(' ')[0]}
          </h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Here's what's happening with your team today.</p>
        </div>

        {/* Summary Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard label="New Reports"  value={summary?.new}       sub="Awaiting review" borderColor="#3b82f6" iconBg="#eff6ff" icon="📋" />
          <StatCard label="Pending"      value={summary?.pending}   sub="In progress"     borderColor="#f59e0b" iconBg="#fffbeb" icon="⏰" />
          <StatCard label="Reviewed"     value={summary?.reviewed}  sub="By supervisors"  borderColor="#22c55e" iconBg="#f0fdf4" icon="✅" />
          <StatCard label="Escalated"    value={summary?.escalated} sub="To management"   borderColor="#f97316" iconBg="#fff7ed" icon="📈" />
        </div>

        {/* Priority Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Critical Priority', val: priorities?.critical, color: '#ef4444' },
            { label: 'High Priority',     val: priorities?.high,     color: '#f97316' },
            { label: 'Medium Priority',   val: priorities?.medium,   color: '#3b82f6' },
            { label: 'Low Priority',      val: priorities?.low,      color: '#64748b' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color }}>{val ?? 0}</span>
            </div>
          ))}
        </div>

        {/* ⭐ Buddy Pairs Panel */}
        <BuddyPairsPanel />

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '15px', fontWeight: '700' }}>Incidents — Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts?.dailyCounts || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '15px', fontWeight: '700' }}>Status Breakdown</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: '#94a3b8', fontSize: '14px' }}>No data yet</div>
            )}
          </div>
        </div>

        {/* Recent Incidents Table */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '15px', fontWeight: '700' }}>Recent Reports (7 days)</h3>
            <button onClick={() => navigate('/supervisor/incidents')}
              style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '20px', padding: '4px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              View all →
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Title', 'Reporter', 'Location', 'Priority', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!recentIncidents?.length && (
                  <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No recent incidents</td></tr>
                )}
                {recentIncidents?.map(inc => (
                  <tr key={inc._id}
                    onClick={() => navigate(`/supervisor/incidents/${inc._id}`)}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{inc.title}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{inc.type}</p>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{inc.reportedBy?.name || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{inc.location?.manualAddress || inc.location?.building || '—'}</td>
                    <td style={{ padding: '12px 16px' }}><PriorityBadge priority={inc.priority} /></td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={inc.status} /></td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(inc.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', borderTop: '3px solid #3b82f6' }}>
            <p style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6', margin: '0 0 4px' }}>{myStats?.reviewed || 0}</p>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Reports I've Reviewed</p>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', borderTop: '3px solid #3b82f6' }}>
            <p style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6', margin: '0 0 4px' }}>{myStats?.teamMembers || 0}</p>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Team Members</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupervisorDashboard;