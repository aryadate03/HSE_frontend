import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';

const InvestigationPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [caseData, setCaseData]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('site-visit');

  // Site Visit
  const [siteVisit, setSiteVisit]             = useState({ done: false, visitDate: '', findings: '' });
  const [siteVisitSaving, setSiteVisitSaving] = useState(false);

  // Root Cause
  const [rootCause, setRootCause]             = useState({ primaryCause: '', contributingFactors: [''] });
  const [rootCauseSaving, setRootCauseSaving] = useState(false);

  // Corrective Actions
  const [correctiveActions, setCorrectiveActions] = useState([{ action: '', completedDate: '', verifiedBy: '' }]);
  const [actionsSaving, setActionsSaving]         = useState(false);

  // Resolve / Report
  const [resolveModal, setResolveModal]   = useState(false);
  const [reportModal, setReportModal]     = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportSummary, setReportSummary] = useState('');
  const [modalSaving, setModalSaving]     = useState(false);

  useEffect(() => { fetchCase(); }, [id]);

  const fetchCase = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/safety-officer/cases/${id}`);
      setCaseData(data.data);
      // Pre-fill from existing investigation if any
      if (data.data.investigation?.siteVisit) {
        const sv = data.data.investigation.siteVisit;
        setSiteVisit({
          done: sv.done || false,
          visitDate: sv.visitDate ? new Date(sv.visitDate).toISOString().split('T')[0] : '',
          findings: sv.findings || '',
        });
      }
      if (data.data.investigation?.rootCause) {
        const rc = data.data.investigation.rootCause;
        setRootCause({
          primaryCause: rc.primaryCause || '',
          contributingFactors: rc.contributingFactors?.length ? rc.contributingFactors : [''],
        });
      }
      if (data.data.investigation?.correctiveActions?.length) {
        setCorrectiveActions(data.data.investigation.correctiveActions.map(ca => ({
          action: ca.action || '',
          completedDate: ca.completedDate ? new Date(ca.completedDate).toISOString().split('T')[0] : '',
          verifiedBy: ca.verifiedBy || '',
        })));
      }
    } catch (err) {
      toast.error('Failed to load case.');
    } finally {
      setLoading(false);
    }
  };

  const saveSiteVisit = async () => {
    setSiteVisitSaving(true);
    try {
      await api.post(`/safety-officer/cases/${id}/site-visit`, {
        visitDate: siteVisit.visitDate,
        findings:  siteVisit.findings,
        done:      siteVisit.done,
      });
      toast.success('Site visit saved!');
      fetchCase();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save site visit.');
    } finally { setSiteVisitSaving(false); }
  };

  const saveRootCause = async () => {
    if (!rootCause.primaryCause.trim()) { toast.error('Primary cause is required.'); return; }
    setRootCauseSaving(true);
    try {
      await api.post(`/safety-officer/cases/${id}/root-cause`, {
        primaryCause:        rootCause.primaryCause,
        contributingFactors: rootCause.contributingFactors.filter(f => f.trim()),
      });
      toast.success('Root cause saved!');
      fetchCase();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save root cause.');
    } finally { setRootCauseSaving(false); }
  };

  const saveCorrectiveActions = async () => {
    const valid = correctiveActions.filter(a => a.action.trim());
    if (!valid.length) { toast.error('At least one corrective action is required.'); return; }
    setActionsSaving(true);
    try {
      await api.post(`/safety-officer/cases/${id}/corrective-actions`, { correctiveActions: valid });
      toast.success('Corrective actions saved!');
      fetchCase();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save corrective actions.');
    } finally { setActionsSaving(false); }
  };

  const handleResolve = async () => {
    if (!resolutionNote.trim()) { toast.error('Resolution note is required.'); return; }
    setModalSaving(true);
    try {
      await api.post(`/safety-officer/cases/${id}/resolve`, { resolutionNote });
      toast.success('Case resolved successfully!');
      setResolveModal(false);
      fetchCase();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve case.');
    } finally { setModalSaving(false); }
  };

  const handleSendReport = async () => {
    if (!reportContent.trim()) { toast.error('Report content is required.'); return; }
    setModalSaving(true);
    try {
      await api.post(`/safety-officer/cases/${id}/report`, { content: reportContent, summary: reportSummary });
      toast.success('Report sent to management!');
      setReportModal(false);
      setReportContent(''); setReportSummary('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send report.');
    } finally { setModalSaving(false); }
  };

  // Helpers
  const addFactor    = () => setRootCause(p => ({ ...p, contributingFactors: [...p.contributingFactors, ''] }));
  const removeFactor = (i) => setRootCause(p => ({ ...p, contributingFactors: p.contributingFactors.filter((_, idx) => idx !== i) }));
  const updateFactor = (i, val) => setRootCause(p => ({ ...p, contributingFactors: p.contributingFactors.map((f, idx) => idx === i ? val : f) }));
  const addAction    = () => setCorrectiveActions(p => [...p, { action: '', completedDate: '', verifiedBy: '' }]);
  const removeAction = (i) => setCorrectiveActions(p => p.filter((_, idx) => idx !== i));
  const updateAction = (i, field, val) => setCorrectiveActions(p => p.map((a, idx) => idx === i ? { ...a, [field]: val } : a));

  const sevColor = (s) => ({ critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' }[s] || '#6b7280');

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: '#0f172a',
    border: '1px solid #334155', borderRadius: '8px',
    color: '#f1f5f9', fontSize: '14px', boxSizing: 'border-box',
    fontFamily: 'inherit', outline: 'none',
  };

  const incident = caseData?.incident;
  const investigation = caseData?.investigation;
  const isResolved = ['resolved', 'closed'].includes(incident?.status);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', background: '#0f172a' }}>
      <Loader size="lg" text="Loading investigation..." />
    </div>
  );

  if (!incident) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8', background: '#0f172a', minHeight: '100vh' }}>
      <p>Case not found.</p>
      <button onClick={() => navigate('/safety-officer/cases')}
        style={{ marginTop: '16px', background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
        ← Back to Cases
      </button>
    </div>
  );

  const TABS = [
    { key: 'site-visit',          label: '📍 Site Visit',         step: 1 },
    { key: 'root-cause',          label: '🔍 Root Cause',         step: 2 },
    { key: 'corrective-actions',  label: '✅ Corrective Actions', step: 3 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>

      {/* Back */}
      <button onClick={() => navigate('/safety-officer/cases')}
        style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', fontSize: '13px' }}>
        ← Back to Cases
      </button>

      {/* Case Header */}
      <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', margin: '0 0 6px' }}>🔬 Investigation Panel</h1>
            <p style={{ color: '#94a3b8', margin: '0 0 4px', fontSize: '14px' }}>
              {incident.title || incident.description?.substring(0, 60)}
            </p>
            <p style={{ color: '#64748b', margin: 0, fontSize: '12px' }}>
              Case ID: <strong style={{ color: '#10b981' }}>{incident.incidentId}</strong>
              {' · '}Reporter: <strong style={{ color: '#94a3b8' }}>{incident.reportedBy?.name}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: sevColor(incident.severity) + '20', color: sevColor(incident.severity), padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: `1px solid ${sevColor(incident.severity)}40` }}>
              {incident.severity?.toUpperCase()}
            </span>
            <span style={{ background: isResolved ? '#22c55e20' : '#f9730620', color: isResolved ? '#22c55e' : '#f97316', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: `1px solid ${isResolved ? '#22c55e' : '#f97316'}40` }}>
              {isResolved ? '✅ RESOLVED' : '🔬 INVESTIGATING'}
            </span>

            {/* Action Buttons */}
            <button onClick={() => setReportModal(true)}
              style={{ background: '#1e3a5f', border: '1px solid #3b82f6', color: '#3b82f6', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
              📋 Send Report
            </button>
            {!isResolved && (
              <button onClick={() => setResolveModal(true)}
                style={{ background: '#14532d', border: '1px solid #22c55e', color: '#22c55e', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                ✅ Resolve Case
              </button>
            )}
          </div>
        </div>

        {/* Forward Note if any */}
        {incident.forwardInfo?.note && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#60a5fa' }}>
              <strong>Supervisor Note:</strong> {incident.forwardInfo.note}
            </p>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div style={{ background: '#1e293b', borderRadius: '16px', padding: '20px', border: '1px solid #334155', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {TABS.map((tab, index) => {
            const isActive = activeTab === tab.key;
            const isDone   = investigation?.status === 'completed' ||
              (tab.key === 'site-visit' && investigation?.siteVisit?.done) ||
              (tab.key === 'root-cause' && investigation?.rootCause?.primaryCause) ||
              (tab.key === 'corrective-actions' && investigation?.correctiveActions?.length > 0);
            return (
              <div key={tab.key} style={{ display: 'flex', alignItems: 'center' }}>
                <div onClick={() => setActiveTab(tab.key)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: '100px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', marginBottom: '6px',
                    background: isDone ? '#16a34a' : isActive ? '#3b82f6' : '#334155',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '16px',
                    border: isActive ? '2px solid #60a5fa' : isDone ? '2px solid #4ade80' : '2px solid #475569',
                    transition: 'all 0.2s',
                  }}>
                    {isDone ? '✓' : tab.step}
                  </div>
                  <span style={{ color: isActive ? '#f1f5f9' : '#64748b', fontSize: '12px', fontWeight: isActive ? '600' : '400', textAlign: 'center' }}>
                    {tab.label}
                  </span>
                </div>
                {index < TABS.length - 1 && (
                  <div style={{ width: '60px', height: '2px', background: '#334155', margin: '0 4px 20px' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ background: '#1e293b', borderRadius: '16px', padding: '28px', border: '1px solid #334155' }}>

        {/* SITE VISIT */}
        {activeTab === 'site-visit' && (
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>📍 Site Visit Details</h2>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '13px' }}>Record details of your physical site investigation</p>

            <div style={{ background: '#0f172a', borderRadius: '10px', padding: '16px', marginBottom: '20px', border: '1px solid #334155' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={siteVisit.done}
                  onChange={e => setSiteVisit(p => ({ ...p, done: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }} />
                <div>
                  <span style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '14px' }}>Site Visit Completed</span>
                  <p style={{ color: '#64748b', margin: '2px 0 0', fontSize: '12px' }}>Check when you have physically visited the incident site</p>
                </div>
              </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>📅 Visit Date</label>
              <input type="date" value={siteVisit.visitDate}
                onChange={e => setSiteVisit(p => ({ ...p, visitDate: e.target.value }))}
                style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>📝 Findings & Observations</label>
              <textarea value={siteVisit.findings}
                onChange={e => setSiteVisit(p => ({ ...p, findings: e.target.value }))}
                placeholder="Describe what you observed: physical conditions, hazards, witness accounts..."
                rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
              <p style={{ color: '#475569', fontSize: '11px', marginTop: '4px' }}>{siteVisit.findings.length} characters</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={saveSiteVisit} disabled={siteVisitSaving}
                style={{ background: siteVisitSaving ? '#334155' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', opacity: siteVisitSaving ? 0.7 : 1 }}>
                {siteVisitSaving ? '⏳ Saving...' : '💾 Save Site Visit'}
              </button>
              <button onClick={() => setActiveTab('root-cause')}
                style={{ background: 'none', border: '1px solid #3b82f6', color: '#3b82f6', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginLeft: 'auto' }}>
                Next: Root Cause →
              </button>
            </div>
          </div>
        )}

        {/* ROOT CAUSE */}
        {activeTab === 'root-cause' && (
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>🔍 Root Cause Analysis</h2>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '13px' }}>Identify the primary cause and all contributing factors</p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>
                🎯 Primary Cause <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea value={rootCause.primaryCause}
                onChange={e => setRootCause(p => ({ ...p, primaryCause: e.target.value }))}
                placeholder="What was the direct, primary cause of this incident? Be specific..."
                rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ color: '#94a3b8', fontWeight: '600', fontSize: '13px' }}>⚠️ Contributing Factors</label>
                <button onClick={addFactor}
                  style={{ background: '#1e3a5f', border: '1px solid #3b82f6', color: '#3b82f6', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                  + Add Factor
                </button>
              </div>
              {rootCause.contributingFactors.map((factor, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#334155', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <input value={factor} onChange={e => updateFactor(i, e.target.value)}
                    placeholder={`Contributing factor ${i + 1}...`}
                    style={{ ...inputStyle, flex: 1 }} />
                  {rootCause.contributingFactors.length > 1 && (
                    <button onClick={() => removeFactor(i)}
                      style={{ background: '#3f1f1f', border: '1px solid #ef444440', color: '#ef4444', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}>
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('site-visit')}
                style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                ← Back
              </button>
              <button onClick={saveRootCause} disabled={rootCauseSaving || !rootCause.primaryCause.trim()}
                style={{ background: !rootCause.primaryCause.trim() || rootCauseSaving ? '#334155' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', opacity: !rootCause.primaryCause.trim() ? 0.5 : 1 }}>
                {rootCauseSaving ? '⏳ Saving...' : '💾 Save Root Cause'}
              </button>
              <button onClick={() => setActiveTab('corrective-actions')}
                style={{ background: 'none', border: '1px solid #3b82f6', color: '#3b82f6', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginLeft: 'auto' }}>
                Next: Corrective Actions →
              </button>
            </div>
          </div>
        )}

        {/* CORRECTIVE ACTIONS */}
        {activeTab === 'corrective-actions' && (
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>✅ Corrective Actions</h2>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '13px' }}>Define actions taken to prevent recurrence</p>

            {correctiveActions.map((action, i) => (
              <div key={i} style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', border: '1px solid #334155', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ color: '#10b981', fontWeight: '700', fontSize: '14px' }}>Action #{i + 1}</span>
                  {correctiveActions.length > 1 && (
                    <button onClick={() => removeAction(i)}
                      style={{ background: '#3f1f1f', border: '1px solid #ef444440', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      Remove
                    </button>
                  )}
                </div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  Action Description <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea value={action.action} onChange={e => updateAction(i, 'action', e.target.value)}
                  placeholder="Describe the corrective action taken..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical', marginBottom: '12px', background: '#1e293b' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>📅 Completed Date</label>
                    <input type="date" value={action.completedDate} onChange={e => updateAction(i, 'completedDate', e.target.value)}
                      style={{ ...inputStyle, background: '#1e293b', colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>👤 Verified By</label>
                    <input type="text" value={action.verifiedBy} onChange={e => updateAction(i, 'verifiedBy', e.target.value)}
                      placeholder="Verifier name..." style={{ ...inputStyle, background: '#1e293b' }} />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addAction}
              style={{ width: '100%', padding: '14px', background: 'none', border: '2px dashed #334155', color: '#64748b', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
              + Add Another Corrective Action
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('root-cause')}
                style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                ← Back
              </button>
              <button onClick={saveCorrectiveActions} disabled={actionsSaving}
                style={{ background: actionsSaving ? '#334155' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', opacity: actionsSaving ? 0.7 : 1 }}>
                {actionsSaving ? '⏳ Saving...' : '💾 Save Corrective Actions'}
              </button>
              {!isResolved && (
                <button onClick={() => setResolveModal(true)}
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginLeft: 'auto' }}>
                  🎉 Complete & Resolve Case
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '28px', width: '480px', maxWidth: '100%', border: '1px solid #334155' }}>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 8px', fontSize: '18px', fontWeight: '700' }}>✅ Resolve Case</h3>
            <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: '13px' }}>
              Provide a resolution note to complete this investigation. Worker and management will be notified.
            </p>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              Resolution Note <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea value={resolutionNote} onChange={e => setResolutionNote(e.target.value)}
              rows={4} placeholder="Summarize how this incident was resolved and what actions were taken..."
              style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '20px' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setResolveModal(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#e2e8f0', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={handleResolve} disabled={modalSaving || !resolutionNote.trim()}
                style={{ background: '#16a34a', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', opacity: (modalSaving || !resolutionNote.trim()) ? 0.5 : 1 }}>
                {modalSaving ? '⏳ Resolving...' : '✅ Confirm Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '28px', width: '480px', maxWidth: '100%', border: '1px solid #334155' }}>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 8px', fontSize: '18px', fontWeight: '700' }}>📋 Send Report to Management</h3>
            <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: '13px' }}>This report will be visible to management in their Reports inbox.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Summary</label>
                <input type="text" value={reportSummary} onChange={e => setReportSummary(e.target.value)}
                  placeholder="Brief summary..." style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Report Content <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea value={reportContent} onChange={e => setReportContent(e.target.value)}
                  rows={5} placeholder="Detailed investigation findings..."
                  style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setReportModal(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#e2e8f0', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={handleSendReport} disabled={modalSaving || !reportContent.trim()}
                style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', opacity: (modalSaving || !reportContent.trim()) ? 0.5 : 1 }}>
                {modalSaving ? '⏳ Sending...' : '📋 Send Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestigationPanel;