import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';

const SEVERITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
const STATUS_COLORS   = { forwarded_to_safety_officer: '#3b82f6', investigating: '#f97316', resolved: '#22c55e', closed: '#94a3b8' };
const STATUS_LABELS   = { forwarded_to_safety_officer: 'New', investigating: 'Investigating', resolved: 'Resolved', closed: 'Closed' };

const getLocation = (loc) => {
  if (!loc) return '—';
  if (typeof loc === 'string') return loc;
  return loc.manualAddress || loc.building || loc.zone || '—';
};

export default function SafetyOfficerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await api.get('/safety-officer/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Loader size="lg" text="Loading dashboard…" />
    </div>
  );

  const { stats, recentCases, monthlyData, bySeverity, byStatus } = data || {};

  // Prepare pie chart data
  const severityPieData = Object.entries(bySeverity || {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v, color: SEVERITY_COLORS[k] || '#94a3b8' }));

  const statusPieData = Object.entries(byStatus || {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: STATUS_LABELS[k] || k, value: v, color: STATUS_COLORS[k] || '#94a3b8' }));

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

      {/* Green Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #065f46, #10b981)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px', fontSize: '18px' }}>🛡️</div>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '700' }}>HSE System</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '12px' }}>Safety Officer Portal</p>
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>
          👤 {user?.name || 'Safety Officer'}
        </div>
      </div>

      <div style={{ padding: '28px 32px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>Dashboard Overview</h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! Here's your safety overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Active Cases', value: stats?.active   ?? 0, color: '#10b981', bg: '#ecfdf5', icon: '📋' },
            { label: 'Overdue',      value: stats?.overdue  ?? 0, color: '#ef4444', bg: '#fef2f2', icon: '⚠️' },
            { label: 'Resolved',     value: stats?.resolved ?? 0, color: '#22c55e', bg: '#f0fdf4', icon: '✅' },
            { label: 'Critical',     value: stats?.critical ?? 0, color: '#f97316', bg: '#fff7ed', icon: '🚨' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px', fontWeight: 500 }}>{s.label}</p>
                  <p style={{ fontSize: '32px', fontWeight: '800', color: s.color, margin: 0 }}>{s.value}</p>
                </div>
                <div style={{ background: s.bg, borderRadius: '12px', padding: '12px', fontSize: '24px' }}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>

          {/* Line Chart */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '15px', fontWeight: '700' }}>Monthly Incident Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="incidents" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Pie */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '15px', fontWeight: '700' }}>By Severity</h3>
            {severityPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={severityPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {severityPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {severityPieData.map(s => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />{s.name}
                    </div>
                  ))}
                </div>
              </>
            ) : <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No data yet</p>}
          </div>

          {/* Status Pie */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '15px', fontWeight: '700' }}>By Status</h3>
            {statusPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {statusPieData.map(s => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />{s.name}
                    </div>
                  ))}
                </div>
              </>
            ) : <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No data yet</p>}
          </div>
        </div>

        {/* Bar Chart */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '28px' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '15px', fontWeight: '700' }}>Incidents by Month</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="incidents" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Cases Table */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '15px', fontWeight: '700' }}>Recent Cases</h3>
            <button onClick={() => navigate('/safety-officer/cases')}
              style={{ background: '#ecfdf5', color: '#10b981', border: 'none', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              View All →
            </button>
          </div>
          {!recentCases?.length ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0', fontSize: '14px' }}>No recent cases</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['ID', 'Description', 'Location', 'Severity', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '700', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentCases.map(c => {
                  const sevColor = SEVERITY_COLORS[c.severity] || '#64748b';
                  const stColor  = STATUS_COLORS[c.status]    || '#64748b';
                  const stLabel  = STATUS_LABELS[c.status]    || c.status;
                  return (
                    <tr key={c._id}
                      onClick={() => navigate('/safety-officer/cases')}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '700', color: '#10b981' }}>{c.incidentId}</td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#1e293b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.title || c.description?.substring(0, 50)}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b' }}>📍 {getLocation(c.location)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: sevColor + '20', color: sevColor, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize' }}>
                          {c.severity}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: stColor + '20', color: stColor, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                          {stLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}