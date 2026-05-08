import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#a855f7', '#ef4444'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/management/analytics');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  // ── Computed summary values from real data ──────────────────────────────
  const mostCommonType = data?.byType?.length
    ? [...data.byType].sort((a, b) => b.count - a.count)[0]?.type || '—'
    : '—';

  const highestSeverity = data?.bySeverity?.length
    ? [...data.bySeverity].sort((a, b) => b.count - a.count)[0]?.severity || '—'
    : '—';

  const peakMonth = data?.byMonth?.length
    ? [...data.byMonth].sort((a, b) => b.count - a.count)[0]?.month || '—'
    : '—';

  const avgPerMonth = data?.byMonth?.length
    ? (data.byMonth.reduce((sum, m) => sum + m.count, 0) / data.byMonth.length).toFixed(1)
    : '0';

  const summaryCards = [
    { label: 'Most Common Type', value: mostCommonType,  icon: '⚗️',  color: '#3b82f6' },
    { label: 'Highest Severity', value: highestSeverity, icon: '🚨',  color: '#ef4444' },
    { label: 'Peak Month',       value: peakMonth,       icon: '📅',  color: '#f97316' },
    { label: 'Avg per Month',    value: avgPerMonth,     icon: '📊',  color: '#22c55e' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
        }} />
        <p style={{ color: '#64748b', fontSize: 14 }}>Loading analytics...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 32 }}>⚠️</p>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
        <button
          onClick={fetchAnalytics}
          style={{ marginTop: 12, padding: '8px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>
          📊 Analytics Dashboard
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
          Detailed insights and trends of HSE incidents
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {summaryCards.map((card, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '28px' }}>{card.icon}</span>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '8px 0 4px 0', fontWeight: '500' }}>{card.label}</p>
            <p style={{ color: card.color, fontSize: '20px', fontWeight: '800', margin: 0, textTransform: 'capitalize' }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Incidents by Type - Bar Chart */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>
            📦 Incidents by Type
          </h3>
          {data?.byType?.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.byType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              No data available
            </div>
          )}
        </div>

        {/* Incidents by Severity - Pie Chart */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>
            🥧 Incidents by Severity
          </h3>
          {data?.bySeverity?.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.bySeverity}
                  cx="50%" cy="50%"
                  outerRadius={90}
                  dataKey="count"
                  label={({ severity, count }) => `${severity}: ${count}`}
                >
                  {data.bySeverity.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              No data available
            </div>
          )}
        </div>

      </div>

      {/* Monthly Trend - Line Chart */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>
          📈 Monthly Incident Trend
        </h3>
        {data?.byMonth?.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                name="Incidents"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            No data available
          </div>
        )}
      </div>

      {/* Incidents by Status - Bar Chart */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>
          🔄 Incidents by Status
        </h3>
        {data?.byStatus?.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.byStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.byStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            No data available
          </div>
        )}
      </div>

    </div>
  );
};

export default Analytics;