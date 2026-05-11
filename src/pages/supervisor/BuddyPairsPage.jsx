import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || 'https://hse-backend-three.vercel.app';

const TASK_TYPES = [
  { value: 'general',           label: '🔧 General' },
  { value: 'scaffolding',       label: '🏗️ Scaffolding' },
  { value: 'electrical',        label: '⚡ Electrical' },
  { value: 'excavation',        label: '⛏️ Excavation' },
  { value: 'welding',           label: '🔥 Welding' },
  { value: 'heavy_machinery',   label: '🚜 Heavy Machinery' },
  { value: 'chemical_handling', label: '⚗️ Chemical Handling' },
];

const STATUS_STYLE = {
  completed:   { bg: '#f0fdf4', color: '#16a34a', label: '✅ Completed' },
  in_progress: { bg: '#eff6ff', color: '#2563eb', label: '🔄 In Progress' },
  pending:     { bg: '#fefce8', color: '#ca8a04', label: '⏳ Pending' },
  skipped:     { bg: '#fef2f2', color: '#dc2626', label: '❌ Skipped' },
};

export default function BuddyPairsPage() {
  const toast = useToast();
  const [pairs, setPairs]       = useState([]);
  const [stats, setStats]       = useState(null);
  const [workers, setWorkers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [taskType, setTaskType] = useState('general');
  const [hasPairs, setHasPairs] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: pairsRes } = await api.get('/buddy/today');
      const fetchedPairs = pairsRes.pairs || [];
      const fetchedStats = pairsRes.stats || null;
      setPairs(fetchedPairs);
      setStats(fetchedStats);
      setHasPairs(fetchedPairs.length > 0);

      const { data: workersRes } = await api.get('/supervisor/team');
      setWorkers(workersRes.data || []);
    } catch (err) {
      toast.error('Failed to load buddy pairs data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ✅ No toast — just refresh data, list will show automatically
  const handleCreatePairs = async () => {
    setCreating(true);
    try {
      await api.post('/buddy/create-pairs', { taskType });
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create pairs.';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleResetPairs = async () => {
    if (!window.confirm('Delete all today\'s pairs and recreate?')) return;
    try {
      await fetch(`${API_BASE}/api/debug/reset-pairs`);
      await fetchData();
    } catch (err) {
      toast.error('Failed to reset pairs.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8, fontSize: 18 }}>🤝</div>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: 20, fontWeight: 700 }}>Safety Buddy Pairs</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: 12 }}>Daily peer-to-peer safety accountability</p>
          </div>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div style={{ padding: '28px 32px' }}>

        {/* Stats Row */}
        {stats && stats.total > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Pairs',  value: stats.total,      color: '#3b82f6' },
              { label: 'Completed',    value: stats.completed,  color: '#16a34a' },
              { label: 'In Progress',  value: stats.inProgress, color: '#2563eb' },
              { label: 'Pending',      value: stats.pending,    color: '#ca8a04' },
              { label: 'Skipped',      value: stats.skipped,    color: '#dc2626' },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}` }}>
                <p style={{ color: '#64748b', fontSize: 12, margin: '0 0 6px', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Workers List */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: 15, fontWeight: 700 }}>
            👷 Available Workers ({workers.length})
          </h3>
          {workers.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No workers found.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {workers.map(w => (
                <div key={w._id} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {w.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{w.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{w.department || 'No dept'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Pairs Section */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: 15, fontWeight: 700 }}>
            ⚙️ Create Today's Pairs
          </h3>

          {hasPairs ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 14, margin: 0 }}>
                  {stats?.total} pairs created for today — see list below
                </p>
              </div>
              <button
                onClick={handleResetPairs}
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                🔄 Reset & Recreate
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>Task Type</label>
                <select
                  value={taskType}
                  onChange={e => setTaskType(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', background: 'white' }}
                >
                  {TASK_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ paddingTop: 20 }}>
                <button
                  onClick={handleCreatePairs}
                  disabled={creating || workers.length < 2}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    background: creating || workers.length < 2 ? '#94a3b8' : '#3b82f6',
                    color: 'white', fontSize: 14, fontWeight: 700,
                    cursor: creating || workers.length < 2 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {creating
                    ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Creating...</>
                    : <>🤝 Create Pairs for {workers.length} Workers</>
                  }
                </button>
                {workers.length < 2 && (
                  <p style={{ color: '#ef4444', fontSize: 11, margin: '4px 0 0' }}>Need at least 2 workers</p>
                )}
              </div>
            </div>
          )}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* Pairs List */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: 15, fontWeight: 700 }}>
              📋 Today's Pairs {pairs.length > 0 && `(${pairs.length})`}
            </h3>
            {pairs.length > 0 && (
              <button onClick={fetchData}
                style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                🔄 Refresh
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              Loading...
            </div>
          ) : pairs.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>🤝</p>
              <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>No pairs created yet</p>
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Select a task type above and click "Create Pairs"</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {pairs.map((pair, i) => {
                const sStyle = STATUS_STYLE[pair.status] || STATUS_STYLE.pending;
                return (
                  <div key={pair._id} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16, background: i % 2 === 0 ? 'white' : '#fafafa' }}>

                    {/* Pair number */}
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>

                    {/* Senior Worker */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {pair.seniorWorker?.name?.slice(0, 2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{pair.seniorWorker?.name || '—'}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>⭐ Senior · {pair.seniorWorker?.department || 'No dept'}</p>
                      </div>
                    </div>

                    {/* Connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                      <span style={{ fontSize: 18, color: '#94a3b8' }}>↔</span>
                      <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 600 }}>
                        {pair.taskType?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Junior Worker */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {pair.juniorWorker?.name?.slice(0, 2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{pair.juniorWorker?.name || '—'}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>📚 Junior · {pair.juniorWorker?.department || 'No dept'}</p>
                      </div>
                    </div>

                    {/* Confirmation status */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: pair.seniorConfirmed ? '#f0fdf4' : '#f8fafc', color: pair.seniorConfirmed ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                        {pair.seniorConfirmed ? '✅ Senior' : '⏳ Senior'}
                      </span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: pair.juniorConfirmed ? '#f0fdf4' : '#f8fafc', color: pair.juniorConfirmed ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                        {pair.juniorConfirmed ? '✅ Junior' : '⏳ Junior'}
                      </span>
                    </div>

                    {/* Status badge */}
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: sStyle.bg, color: sStyle.color, flexShrink: 0 }}>
                      {sStyle.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
