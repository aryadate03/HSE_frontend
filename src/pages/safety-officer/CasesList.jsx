import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const severityStyle = {
  critical: { bg: '#fef2f2', color: '#dc2626' },
  high:     { bg: '#fff7ed', color: '#ea580c' },
  medium:   { bg: '#fefce8', color: '#ca8a04' },
  low:      { bg: '#f0fdf4', color: '#16a34a' },
};

const statusStyle = {
  forwarded_to_safety_officer: { bg: '#eff6ff', color: '#2563eb',  label: 'New — Awaiting Action' },
  investigating:               { bg: '#fff7ed', color: '#d97706',  label: 'Investigating' },
  resolved:                    { bg: '#f0fdf4', color: '#16a34a',  label: 'Resolved' },
  closed:                      { bg: '#f1f5f9', color: '#475569',  label: 'Closed' },
};

const getLocation = (loc) => {
  if (!loc) return '—';
  if (typeof loc === 'string') return loc;
  return loc.manualAddress || loc.building || loc.zone || '—';
};

export default function CasesList() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [cases, setCases]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selected, setSelected]     = useState(null);
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterStatus !== 'all')   params.status   = filterStatus;
      if (filterSeverity !== 'all') params.severity = filterSeverity;

      const { data } = await api.get('/safety-officer/cases', { params });
      setCases(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load cases.');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterSeverity]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  const handleStartInvestigation = async (id) => {
    try {
      await api.put(`/safety-officer/cases/${id}/start`);
      toast.success('Investigation started!');
      fetchCases();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start investigation.');
    }
  };

  // Client-side search filter
  const filtered = cases.filter(c =>
    (c.title || c.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.incidentId || '').toLowerCase().includes(search.toLowerCase())
  );

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

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>Assigned Cases</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            Incidents forwarded by supervisors for investigation — {total} total
          </p>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            placeholder="🔍 Search by title or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
          />
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: 'white' }}>
            <option value="all">All Status</option>
            <option value="forwarded_to_safety_officer">New — Awaiting Action</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value); setPage(1); }}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: 'white' }}>
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <span style={{ background: '#ecfdf5', color: '#10b981', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
            {filtered.length} Results
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader text="Loading cases…" />
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['ID', 'Description', 'Location', 'Severity', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '700', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                      <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🔍</p>
                      <p style={{ margin: 0 }}>No cases found</p>
                    </td>
                  </tr>
                ) : filtered.map(c => {
                  const sStyle = statusStyle[c.status] || { bg: '#f1f5f9', color: '#475569', label: c.status };
                  const sevStyle = severityStyle[c.severity] || { bg: '#f1f5f9', color: '#475569' };
                  return (
                    <tr key={c._id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: '#10b981' }}>{c.incidentId || '—'}</td>
                      <td style={{ padding: '14px 16px', maxWidth: '200px' }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.title || c.description?.substring(0, 50)}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{c.incidentType?.replace('_', ' ') || '—'}</p>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                        📍 {getLocation(c.location)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: sevStyle.bg, color: sevStyle.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'capitalize' }}>
                          {c.severity || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: sStyle.bg, color: sStyle.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                          {sStyle.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => setSelected(c)}
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                          View
                        </button>
                        {c.status === 'forwarded_to_safety_officer' && (
                          <button onClick={() => handleStartInvestigation(c._id)}
                            style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                            🔬 Start
                          </button>
                        )}
                        {c.status === 'investigating' && (
                          <button onClick={() => navigate(`/safety-officer/investigation/${c._id}`)}
                            style={{ background: '#0f172a', color: '#10b981', border: '1px solid #10b981', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                            🔬 Investigate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Page {page} of {totalPages}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                    ← Prev
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '500px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Case Details</h3>
              <button onClick={() => setSelected(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            {[
              { label: 'Incident ID',  value: selected.incidentId },
              { label: 'Description',  value: selected.description },
              { label: 'Type',         value: selected.incidentType?.replace(/_/g, ' ') },
              { label: 'Location',     value: getLocation(selected.location) },
              { label: 'Severity',     value: selected.severity },
              { label: 'Status',       value: statusStyle[selected.status]?.label || selected.status },
              { label: 'Date',         value: new Date(selected.createdAt).toLocaleString() },
              { label: 'Reporter',     value: selected.reportedBy?.name },
              { label: 'Department',   value: selected.reportedBy?.department },
              { label: 'Forwarded By', value: selected.forwardInfo?.forwardedBy?.name },
              { label: 'Forward Note', value: selected.forwardInfo?.note },
            ].filter(i => i.value).map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', gap: '16px' }}>
                <span style={{ color: '#64748b', fontSize: '13px', flexShrink: 0 }}>{item.label}</span>
                <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: '600', textAlign: 'right' }}>{item.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setSelected(null)}
                style={{ flex: 1, background: '#f1f5f9', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>
                Close
              </button>
              {selected.status === 'investigating' && (
                <button onClick={() => { setSelected(null); navigate(`/safety-officer/investigation/${selected._id}`); }}
                  style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>
                  🔬 Open Investigation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}