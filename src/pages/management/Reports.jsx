import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const REPORT_TYPE_STYLE = {
  supervisor_report:      { label: '👔 Supervisor Report',      bg: '#eff6ff', color: '#2563eb' },
  safety_officer_report:  { label: '🛡️ Safety Officer Report',  bg: '#ecfdf5', color: '#10b981' },
};

const SEVERITY_STYLE = {
  critical: { bg: '#fef2f2', color: '#dc2626' },
  high:     { bg: '#fff7ed', color: '#ea580c' },
  medium:   { bg: '#fefce8', color: '#ca8a04' },
  low:      { bg: '#f0fdf4', color: '#16a34a' },
};

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch]       = useState('');
  const [expanded, setExpanded]   = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get('/management/reports');
        setReports(data.data || []);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filtered = reports.filter(r => {
    const matchType   = filterType === 'all' || r.reportType === filterType;
    const matchSearch = search === '' ||
      (r.incidentId || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.incidentDescription || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.sentBy?.name || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const supervisorCount     = reports.filter(r => r.reportType === 'supervisor_report').length;
  const safetyOfficerCount  = reports.filter(r => r.reportType === 'safety_officer_report').length;

  return (
    <div style={{ padding: '24px 32px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>📄 Reports Inbox</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
          Reports submitted by Supervisors and Safety Officers
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Reports',         value: reports.length,       color: '#ef4444', bg: '#fef2f2', icon: '📋' },
          { label: 'Supervisor Reports',    value: supervisorCount,      color: '#2563eb', bg: '#eff6ff', icon: '👔' },
          { label: 'Safety Officer Reports',value: safetyOfficerCount,   color: '#10b981', bg: '#ecfdf5', icon: '🛡️' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 6px', fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '800', color: s.color, margin: 0 }}>{s.value}</p>
            </div>
            <div style={{ background: s.bg, borderRadius: '12px', padding: '12px', fontSize: '22px' }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by incident ID, description or sender..."
          style={{ flex: 1, minWidth: '200px', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}>
          <option value="all">All Reports</option>
          <option value="supervisor_report">Supervisor Reports</option>
          <option value="safety_officer_report">Safety Officer Reports</option>
        </select>
        <span style={{ background: '#fef2f2', color: '#ef4444', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
          {filtered.length} Reports
        </span>
      </div>

      {/* Reports List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#64748b' }}>⏳ Loading reports...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '36px', margin: '0 0 8px' }}>📭</p>
          <p style={{ color: '#64748b', margin: 0, fontWeight: '600' }}>No reports found</p>
          <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '13px' }}>Reports will appear here when supervisors or safety officers submit them.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((report, i) => {
            const rStyle  = REPORT_TYPE_STYLE[report.reportType] || { label: report.reportType, bg: '#f1f5f9', color: '#475569' };
            const sevStyle = SEVERITY_STYLE[report.severity] || { bg: '#f1f5f9', color: '#64748b' };
            const isExpanded = expanded === i;
            return (
              <div key={i} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                {/* Report Header */}
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '16px' }}
                  onClick={() => setExpanded(isExpanded ? null : i)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    <span style={{ background: rStyle.bg, color: rStyle.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      {rStyle.label}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1e293b', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.summary || report.incidentDescription || 'Report'}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                        Incident: <strong style={{ color: '#64748b' }}>{report.incidentId}</strong>
                        {' · '}Sent by: <strong style={{ color: '#64748b' }}>{report.sentBy?.name || '—'}</strong>
                        {' · '}{new Date(report.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {report.severity && (
                      <span style={{ background: sevStyle.bg, color: sevStyle.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize' }}>
                        {report.severity}
                      </span>
                    )}
                    <span style={{ color: '#94a3b8', fontSize: '16px' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ paddingTop: '16px' }}>
                      {report.summary && (
                        <div style={{ marginBottom: '12px' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</p>
                          <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{report.summary}</p>
                        </div>
                      )}
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Report</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          {report.content}
                        </p>
                      </div>
                      <div style={{ marginTop: '12px', display: 'flex', gap: '20px' }}>
                        <div>
                          <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Sent By</p>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{report.sentBy?.name || '—'}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Role</p>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b', textTransform: 'capitalize' }}>
                            {report.sentBy?.role?.replace('_', ' ') || '—'}
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Sent At</p>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                            {new Date(report.sentAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Incident</p>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>{report.incidentId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reports;