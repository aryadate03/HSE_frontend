import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE  = 'http://localhost:5000/api/management';
const AUTH_BASE = 'http://localhost:5000/api/auth';

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [data, setData]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [pendingUsers, setPendingUsers]   = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal]     = useState(null);
  const [rejectReason, setRejectReason]   = useState('');

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchDashboard();
    fetchPendingUsers();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard`, authHeaders);
      setData(res.data.data);
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get(`${AUTH_BASE}/pending-users`, authHeaders);
      setPendingUsers(res.data.users || []);
    } catch (err) {
      console.error('Pending users fetch failed:', err);
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      await axios.put(`${AUTH_BASE}/approve/${userId}`, {}, authHeaders);
      setPendingUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal._id);
    try {
      await axios.put(`${AUTH_BASE}/reject/${rejectModal._id}`, { reason: rejectReason }, authHeaders);
      setPendingUsers(prev => prev.filter(u => u._id !== rejectModal._id));
      setRejectModal(null);
      setRejectReason('');
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const COLORS = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#a855f7'];

  const roleLabel      = (role) => role === 'safety_officer' ? 'Safety Officer' : 'Supervisor';
  const roleBadgeColor = (role) => role === 'safety_officer'
    ? { bg: '#eff6ff', color: '#2563eb' }
    : { bg: '#fdf4ff', color: '#a855f7' };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ color: '#ef4444', fontSize: '18px', fontWeight: '600' }}>⏳ Loading dashboard...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>

      {/* Red Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #991b1b, #ef4444)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px', fontSize: '18px' }}>
            📊
          </div>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '700' }}>HSE System</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '12px' }}>Management Portal</p>
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>
          👤 {user?.name || 'Management'}
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>📊 Management Dashboard</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Executive overview of HSE system performance</p>
        </div>

        {/* ── Pending Approvals ─────────────────────────────────────────────── */}
        {pendingUsers.length > 0 && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '2px solid #fbbf24', marginBottom: '24px', boxShadow: '0 2px 8px rgba(251,191,36,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>⏳</span>
              <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '700', margin: 0 }}>Pending Approvals</h3>
              <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                {pendingUsers.length} waiting
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingUsers.map((u) => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '14px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
                    <div>
                      <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{u.name}</p>
                      <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '13px' }}>{u.email}</p>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: roleBadgeColor(u.role).bg, color: roleBadgeColor(u.role).color }}>
                          {roleLabel(u.role)}
                        </span>
                        {u.department && <span style={{ color: '#94a3b8', fontSize: '12px' }}>🏢 {u.department}</span>}
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>📅 {new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleApprove(u._id)} disabled={actionLoading === u._id}
                      style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', opacity: actionLoading === u._id ? 0.6 : 1 }}>
                      {actionLoading === u._id ? '⏳' : '✅ Approve'}
                    </button>
                    <button onClick={() => { setRejectModal(u); setRejectReason(''); }} disabled={actionLoading === u._id}
                      style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Incidents',  value: data?.stats?.totalIncidents   || 0,     color: '#3b82f6', icon: '📋' },
            { label: 'In Progress',      value: data?.stats?.inProgress       || 0,     color: '#f97316', icon: '⏳' },
            { label: 'Resolved',         value: data?.stats?.resolved         || 0,     color: '#22c55e', icon: '✅' },
            { label: 'Critical',         value: data?.stats?.critical         || 0,     color: '#ef4444', icon: '🚨' },
            { label: 'Compliance Rate',  value: `${data?.stats?.complianceRate || 0}%`, color: '#a855f7', icon: '📈' },
          ].map((card, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid ' + card.color }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px 0', fontWeight: '500' }}>{card.label}</p>
                  <p style={{ color: card.color, fontSize: '28px', fontWeight: '800', margin: 0 }}>{card.value}</p>
                </div>
                <span style={{ fontSize: '28px' }}>{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>📈 Incident Trend (6 Months)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>🥧 By Severity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data?.bySeverity?.length ? data.bySeverity : [
                    { name: 'Critical', value: 1 },
                    { name: 'High', value: 2 },
                    { name: 'Medium', value: 1 },
                    { name: 'Low', value: 1 },
                  ]}
                  cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Incidents */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '700', margin: 0 }}>🕐 Recent Incidents</h3>
            <button onClick={() => navigate('/management/incidents')}
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              View All →
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                {['ID', 'Description', 'Severity', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.recentIncidents || []).length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No incidents found</td></tr>
              ) : (
                (data?.recentIncidents || []).map((inc, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700', color: '#ef4444' }}>{inc.incidentId}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.description}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                        background: { critical: '#fef2f2', high: '#fff7ed', medium: '#fefce8', low: '#f0fdf4' }[inc.severity],
                        color: { critical: '#ef4444', high: '#f97316', medium: '#ca8a04', low: '#16a34a' }[inc.severity],
                      }}>{inc.severity}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                        background: { resolved: '#f0fdf4', investigating: '#eff6ff', submitted: '#fefce8', closed: '#f8fafc' }[inc.status] || '#f1f5f9',
                        color: { resolved: '#16a34a', investigating: '#3b82f6', submitted: '#ca8a04', closed: '#64748b' }[inc.status] || '#475569',
                      }}>{inc.status?.replace(/_/g, ' ')}</span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                      {new Date(inc.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>{/* end padding div */}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '440px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: '18px', fontWeight: '700' }}>❌ Reject Registration</h3>
            <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: '14px' }}>
              Rejecting <strong>{rejectModal.name}</strong> ({roleLabel(rejectModal.role)}). They will be notified via email.
            </p>
            <label style={{ display: 'block', color: '#475569', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              rows={3}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectModal(null)}
                style={{ background: '#f1f5f9', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>
                Cancel
              </button>
              <button onClick={handleReject} disabled={!!actionLoading}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', opacity: actionLoading ? 0.6 : 1 }}>
                {actionLoading ? '⏳ Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagementDashboard;