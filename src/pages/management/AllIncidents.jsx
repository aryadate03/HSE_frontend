import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_DISPLAY = {
  draft:                       { label: 'Draft',                       bg: '#f1f5f9', color: '#64748b' },
  submitted:                   { label: 'Submitted',                   bg: '#eff6ff', color: '#2563eb' },
  under_review:                { label: 'Under Review',                bg: '#fefce8', color: '#ca8a04' },
  forwarded_to_safety_officer: { label: 'Fwd → Safety Officer',       bg: '#f0fdf4', color: '#16a34a' },
  investigating:               { label: 'Investigating',               bg: '#fff7ed', color: '#d97706' },
  resolved:                    { label: 'Resolved',                    bg: '#ecfdf5', color: '#059669' },
  closed:                      { label: 'Closed',                      bg: '#f8fafc', color: '#475569' },
  rejected:                    { label: 'Rejected',                    bg: '#fef2f2', color: '#dc2626' },
};

const SEVERITY_STYLE = {
  critical: { bg: '#fef2f2', color: '#dc2626' },
  high:     { bg: '#fff7ed', color: '#ea580c' },
  medium:   { bg: '#fefce8', color: '#ca8a04' },
  low:      { bg: '#f0fdf4', color: '#16a34a' },
};

const AllIncidents = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [incidents, setIncidents]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus]     = useState('all');
  const [page, setPage]                 = useState(1);
  const [pagination, setPagination]     = useState({ total: 0, pages: 1 });
  const [selected, setSelected]         = useState(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filterStatus !== 'all')   params.status   = filterStatus;
      if (filterSeverity !== 'all') params.severity = filterSeverity;
      if (search)                   params.search   = search;

      const { data } = await api.get('/management/incidents', { params });
      setIncidents(data.data || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterSeverity, search]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchIncidents(), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleClose = async (id) => {
    const notes = prompt('Close reason (optional):');
    if (notes === null) return; // cancelled
    try {
      await api.put(`/management/incidents/${id}/close`, { notes });
      fetchIncidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close incident.');
    }
  };

  return (
    <div style={{ padding: '24px 32px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>📋 All Incidents</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            Full incident tracking — {pagination.total} total
          </p>
        </div>
        <button onClick={() => navigate('/management/dashboard')}
          style={{ background: 'none', border: '1px solid #e2e8f0', color: '#64748b', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
          ← Dashboard
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="🔍 Search by description or ID..."
          style={{ flex: 1, minWidth: '200px', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
        <select value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value); setPage(1); }}
          style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}>
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}>
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="forwarded_to_safety_officer">Fwd → Safety Officer</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="rejected">Rejected</option>
        </select>
        <span style={{ background: '#fef2f2', color: '#ef4444', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
          {pagination.total} Results
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#64748b' }}>⏳ Loading...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['ID', 'Description', 'Type', 'Location', 'Severity', 'Status', 'Reported By', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontSize: '28px', margin: '0 0 8px' }}>🔍</p>
                    <p style={{ margin: 0 }}>No incidents found</p>
                  </td></tr>
                ) : incidents.map((inc) => {
                  const sStyle = STATUS_DISPLAY[inc.status] || { label: inc.status, bg: '#f1f5f9', color: '#64748b' };
                  const sevStyle = SEVERITY_STYLE[inc.severity] || { bg: '#f1f5f9', color: '#64748b' };
                  return (
                    <tr key={inc._id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>{inc.incidentId}</td>
                      <td style={{ padding: '12px 14px', maxWidth: '180px' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inc.title || inc.description?.substring(0, 50)}
                        </p>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>{inc.type || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b' }}>📍 {inc.location}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: sevStyle.bg, color: sevStyle.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize' }}>
                          {inc.severity}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: sStyle.bg, color: sStyle.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                          {sStyle.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b' }}>
                        {inc.reportedBy?.name || inc.reportedByName || '—'}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(inc.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 14px', display: 'flex', gap: '6px' }}>
                        <button onClick={() => setSelected(inc)}
                          style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                          View
                        </button>
                        {!['closed', 'rejected'].includes(inc.status) && (
                          <button onClick={() => handleClose(inc._id)}
                            style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                            Close
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Page {page} of {pagination.pages} • {pagination.total} total</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                  ← Prev
                </button>
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', opacity: page === pagination.pages ? 0.4 : 1 }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '560px', maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Incident Details</h3>
              <button onClick={() => setSelected(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            {/* Status badge */}
            <div style={{ marginBottom: '16px' }}>
              {(() => {
                const s = STATUS_DISPLAY[selected.status] || { label: selected.status, bg: '#f1f5f9', color: '#64748b' };
                return <span style={{ background: s.bg, color: s.color, padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>{s.label}</span>;
              })()}
            </div>

            {[
              { label: 'Incident ID',    value: selected.incidentId },
              { label: 'Description',    value: selected.description },
              { label: 'Type',           value: selected.incidentType?.replace(/_/g, ' ') },
              { label: 'Location',       value: selected.location },
              { label: 'Severity',       value: selected.severity },
              { label: 'Reported By',    value: selected.reportedBy?.name || selected.reportedByName },
              { label: 'Department',     value: selected.reportedBy?.department },
              { label: 'Date',           value: new Date(selected.createdAt).toLocaleString() },
              { label: 'Supervisor',     value: selected.supervisorReview?.reviewedBy?.name },
              { label: 'Assessment',     value: selected.supervisorReview?.assessment },
              { label: 'Forwarded By',   value: selected.forwardInfo?.forwardedBy?.name },
              { label: 'Forward Note',   value: selected.forwardInfo?.note },
              { label: 'Investigator',   value: selected.investigation?.assignedTo?.name },
              { label: 'Rejection Reason', value: selected.rejectionInfo?.reason },
            ].filter(i => i.value).map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', gap: '16px' }}>
                <span style={{ color: '#64748b', fontSize: '13px', flexShrink: 0 }}>{item.label}</span>
                <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: '600', textAlign: 'right', maxWidth: '60%' }}>{item.value}</span>
              </div>
            ))}

            {/* Reports section */}
            {selected.reports?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>
                  📋 Reports ({selected.reports.length})
                </h4>
                {selected.reports.map((r, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: r.reportType === 'supervisor_report' ? '#2563eb' : '#10b981' }}>
                        {r.reportType === 'supervisor_report' ? '👔 Supervisor Report' : '🛡️ Safety Officer Report'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(r.sentAt).toLocaleDateString()}</span>
                    </div>
                    {r.summary && <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{r.summary}</p>}
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{r.content}</p>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setSelected(null)}
              style={{ marginTop: '20px', width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllIncidents;