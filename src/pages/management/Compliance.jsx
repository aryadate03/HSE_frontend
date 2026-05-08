import { useState, useEffect } from 'react';
import api from '../../services/api';

const Compliance = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [complianceData, setComplianceData] = useState({
    overall: 0,
    byDepartment: [],
    total: 0,
    resolved: 0,
  });

  useEffect(() => { fetchCompliance(); }, []);

  const fetchCompliance = async () => {
    try {
      const res = await api.get('/management/compliance');
      setComplianceData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch compliance data:', err);
      setError('Failed to load compliance data.');
    } finally {
      setLoading(false);
    }
  };

  // Derive dept status label from rate
  const getDeptStatus = (rate) => {
    if (rate >= 80) return 'excellent';
    if (rate >= 60) return 'good';
    if (rate >= 40) return 'warning';
    return 'critical';
  };

  const deptColor = {
    excellent: { bg: '#f0fdf4', color: '#16a34a' },
    good:      { bg: '#eff6ff', color: '#3b82f6' },
    warning:   { bg: '#fefce8', color: '#ca8a04' },
    critical:  { bg: '#fef2f2', color: '#ef4444' },
  };

  const nonResolved = (complianceData.total || 0) - (complianceData.resolved || 0);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
        }} />
        <p style={{ color: '#64748b', fontSize: 14 }}>Loading compliance data...</p>
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
          onClick={fetchCompliance}
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
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>✅ Compliance</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Monitor and manage HSE compliance across departments</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Overall Compliance', value: `${complianceData.overall}%`,   color: '#22c55e', icon: '📊' },
          { label: 'Total Incidents',    value: complianceData.total,            color: '#3b82f6', icon: '📁' },
          { label: 'Resolved',           value: complianceData.resolved,         color: '#10b981', icon: '✅' },
          { label: 'Unresolved',         value: nonResolved,                     color: '#ef4444', icon: '❌' },
        ].map((card, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'overview',  label: '📊 Overview' },
          { id: 'checklist', label: '📋 Checklist' },
          { id: 'audits',    label: '🔍 Audit History' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
              fontWeight: '600', fontSize: '14px', transition: 'all 0.2s',
              background: activeTab === tab.id ? '#3b82f6' : 'white',
              color: activeTab === tab.id ? 'white' : '#64748b',
              border: activeTab === tab.id ? 'none' : '1px solid #e2e8f0',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '700', margin: '0 0 20px 0' }}>
            📈 Compliance by Department
          </h3>
          {!complianceData.byDepartment?.length ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>No department data available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {complianceData.byDepartment.map((dept, i) => {
                const status = getDeptStatus(dept.rate);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                          {dept.department || 'Unknown'}
                        </span>
                        <span style={{ marginLeft: 10, fontSize: '12px', color: '#94a3b8' }}>
                          {dept.resolved}/{dept.total} resolved
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: deptColor[status].color }}>
                          {dept.rate}%
                        </span>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                          background: deptColor[status].bg, color: deptColor[status].color,
                          textTransform: 'capitalize',
                        }}>
                          {status}
                        </span>
                      </div>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '999px',
                        width: `${dept.rate}%`,
                        background: deptColor[status].color,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CHECKLIST TAB */}
      {activeTab === 'checklist' && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px 24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ fontSize: 40, margin: '0 0 12px 0' }}>📋</p>
          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 16, margin: '0 0 6px 0' }}>Checklist Coming Soon</p>
          <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
            Compliance checklist items will appear here once configured.
          </p>
        </div>
      )}

      {/* AUDITS TAB */}
      {activeTab === 'audits' && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px 24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ fontSize: 40, margin: '0 0 12px 0' }}>🔍</p>
          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 16, margin: '0 0 6px 0' }}>Audit History Coming Soon</p>
          <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
            Audit records will appear here once the audit module is implemented.
          </p>
        </div>
      )}

    </div>
  );
};

export default Compliance;