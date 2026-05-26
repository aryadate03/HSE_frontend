import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supervisorAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const PRIORITY_COLORS = {
  low:      { active: { background: '#475569', color: 'white' }, idle: { background: 'transparent', color: '#94a3b8', border: '1px solid #475569' } },
  medium:   { active: { background: '#3b82f6', color: 'white' }, idle: { background: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6' } },
  high:     { active: { background: '#f97316', color: 'white' }, idle: { background: 'transparent', color: '#f97316', border: '1px solid #f97316' } },
  critical: { active: { background: '#ef4444', color: 'white' }, idle: { background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' } },
};

const STATUS_STYLE = {
  new:          { background: '#eff6ff', color: '#2563eb' },
  pending:      { background: '#fefce8', color: '#ca8a04' },
  forwarded:    { background: '#f0fdf4', color: '#16a34a' },
  rejected:     { background: '#fef2f2', color: '#dc2626' },
  investigating:{ background: '#fff7ed', color: '#d97706' },
  resolved:     { background: '#ecfdf5', color: '#059669' },
  closed:       { background: '#f1f5f9', color: '#475569' },
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '12px' }}>
    <span style={{ fontSize: '11px', color: '#8892a4', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: '13px', color: '#e8eaf0', textAlign: 'right' }}>{value || '—'}</span>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ background: '#1e2537', borderRadius: '16px', padding: '24px', width: '460px', maxWidth: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#e8eaf0' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', color: '#8892a4', fontSize: '16px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const IncidentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [incident, setIncident]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [assessment, setAssessment] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  const [rejectModal,  setRejectModal]  = useState(false);
  const [forwardModal, setForwardModal] = useState(false);
  const [reportModal,  setReportModal]  = useState(false);
  const [rejectReason,  setRejectReason]  = useState('');
  const [forwardNote,   setForwardNote]   = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportSummary, setReportSummary] = useState('');

  const [suggestedOfficer,  setSuggestedOfficer]  = useState(null);
  const [allOfficers,       setAllOfficers]        = useState([]);
  const [selectedOfficerId, setSelectedOfficerId]  = useState('');

  useEffect(() => { fetchIncident(); }, [id]);

  const fetchIncident = async () => {
    setLoading(true);
    try {
      const { data } = await supervisorAPI.getIncident(id);
      const inc = data.data;
      setIncident(inc);
      setAssessment(inc.supervisorReview?.assessment || '');
      setSelectedPriority(inc.priority || 'medium');
    } catch {
      toast.error('Failed to load incident details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssessment = async () => {
    if (!assessment.trim()) { toast.error('Assessment cannot be empty.'); return; }
    setSaving(true);
    try {
      await supervisorAPI.addAssessment(id, { initialAssessment: assessment });
      toast.success('Assessment saved.');
      fetchIncident();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const handleUpdatePriority = async (priority) => {
    setSelectedPriority(priority);
    try {
      await supervisorAPI.updatePriority(id, { priority });
      toast.success(`Priority updated to ${priority}.`);
      setIncident(p => ({ ...p, priority }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update priority.');
    }
  };

  const handleOpenForwardModal = async () => {
    setForwardModal(true);
    try {
      const { data } = await supervisorAPI.getSuggestedOfficer(id);
      setSuggestedOfficer(data.suggested);
      setAllOfficers(data.allOfficers || []);
      if (data.suggested) setSelectedOfficerId(data.suggested._id);
    } catch {
      // Non-fatal
    }
  };

  const handleForward = async () => {
    setSaving(true);
    try {
      await supervisorAPI.forwardToSafetyOfficer(id, {
        note: forwardNote,
        assessment,
        assignedOfficerId: selectedOfficerId || undefined,
      });
      toast.success('Incident forwarded to Safety Officer!');
      setForwardModal(false);
      fetchIncident();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to forward.');
    } finally { setSaving(false); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Rejection reason is required.'); return; }
    setSaving(true);
    try {
      await supervisorAPI.rejectIncident(id, { rejectionReason: rejectReason });
      toast.success('Incident rejected.');
      setRejectModal(false);
      fetchIncident();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject.');
    } finally { setSaving(false); }
  };

  const handleSendReport = async () => {
    if (!reportContent.trim()) { toast.error('Report content is required.'); return; }
    setSaving(true);
    try {
      await supervisorAPI.sendReport(id, { content: reportContent, summary: reportSummary });
      toast.success('Report sent to management!');
      setReportModal(false);
      setReportContent(''); setReportSummary('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send report.');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
      <Loader size="lg" text="Loading incident…" />
    </div>
  );

  if (!incident) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <p style={{ color: '#8892a4' }}>Incident not found.</p>
      <button onClick={() => navigate('/supervisor/incidents')}
        style={{ marginTop: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#e8eaf0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
        ← Back
      </button>
    </div>
  );

  const incidentTitle = incident.title || incident.description?.substring(0, 80) || 'Untitled';
  const incidentType  = incident.type  || incident.incidentType?.replace(/_/g, ' ') || '—';
  const incidentLocation = (() => {
    const loc = incident.location;
    if (!loc) return '—';
    if (typeof loc === 'string') return loc;
    const parts = [loc.building, loc.floor && `Floor ${loc.floor}`, loc.zone, loc.manualAddress].filter(Boolean);
    return parts.join(', ') || '—';
  })();
  const rejectionReason = incident.rejectionInfo?.reason || null;
  const forwardNoteInfo = incident.forwardInfo?.note || null;
  const hasInjury       = incident.hasInjury || false;
  const witnessCount    = incident.witnesses?.length || 0;

  const isActionable = !['rejected', 'resolved', 'closed', 'forwarded'].includes(incident.status);
  const isForwarded  = incident.status === 'forwarded';

  const statusStyle = STATUS_STYLE[incident.status] || { background: '#f1f5f9', color: '#475569' };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
    color: '#e8eaf0', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  };

  // ✅ Select ke liye alag style — solid dark background zaroori hai
  const selectStyle = {
    ...inputStyle,
    background: '#0f1729',
    color: '#e8eaf0',
    colorScheme: 'dark',
    marginBottom: '16px',
  };

  return (
    <div style={{ maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/supervisor/incidents')}
          style={{ background: 'none', border: 'none', color: '#8892a4', cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ← Back to Team Reports
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#e8eaf0', lineHeight: 1.3 }}>
              {incidentTitle}
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ ...statusStyle, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'capitalize' }}>
                {incident.status}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.08)', color: '#e8eaf0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                {incident.priority || 'normal'} priority
              </span>
              {hasInjury && (
                <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>⚠️ Injury</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setReportModal(true)}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#e8eaf0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📋 Send Report
            </button>

            {isActionable && (
              <>
                <button onClick={handleOpenForwardModal}
                  style={{ background: '#16a34a', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✅ Forward to Safety Officer
                </button>
                <button onClick={() => setRejectModal(true)}
                  style={{ background: '#dc2626', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ❌ Reject
                </button>
              </>
            )}

            {isForwarded && (
              <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0' }}>
                ✅ Forwarded to Safety Officer
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Incident Details */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#e8eaf0' }}>Incident Details</h3>
            <p style={{ fontSize: '14px', color: '#8892a4', lineHeight: 1.6, marginBottom: '16px' }}>{incident.description}</p>
            <InfoRow label="Type"          value={incidentType} />
            <InfoRow label="Location"      value={incidentLocation} />
            <InfoRow label="Date Reported" value={new Date(incident.createdAt).toLocaleString()} />
            <InfoRow label="Incident Date" value={incident.dateTime ? new Date(incident.dateTime).toLocaleString() : '—'} />
            <InfoRow label="Severity"      value={incident.severity} />
            <InfoRow label="Witnesses"     value={witnessCount > 0 ? `${witnessCount} witness(es)` : 'None'} />
            {hasInjury && <InfoRow label="Injury" value="Yes — injury occurred" />}

            {rejectionReason && (
              <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#f87171', fontWeight: '700', textTransform: 'uppercase' }}>Rejection Reason</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#e8eaf0' }}>{rejectionReason}</p>
              </div>
            )}
            {forwardNoteInfo && (
              <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#4ade80', fontWeight: '700', textTransform: 'uppercase' }}>Forward Note</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#e8eaf0' }}>{forwardNoteInfo}</p>
              </div>
            )}
          </div>

          {/* Photos */}
          {incident.photos?.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#e8eaf0' }}>Photos ({incident.photos.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {incident.photos.map((photo, i) => (
                  <a key={i} href={`/uploads/${photo.filename || photo.url}`} target="_blank" rel="noopener noreferrer"
                    style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', display: 'block', background: '#1e2537', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <img src={`/uploads/${photo.filename || photo.url}`} alt={`Photo ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Assessment */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#e8eaf0' }}>Supervisor Assessment</h3>
            <label style={{ display: 'block', fontSize: '12px', color: '#8892a4', marginBottom: '6px' }}>Assessment *</label>
            <textarea value={assessment} onChange={e => setAssessment(e.target.value)}
              rows={4} placeholder="Describe your assessment of this incident…"
              disabled={!isActionable}
              style={{ ...inputStyle, resize: 'vertical', opacity: isActionable ? 1 : 0.5 }} />
            {isActionable && (
              <button onClick={handleSaveAssessment} disabled={saving}
                style={{ marginTop: '10px', background: '#3b82f6', border: 'none', color: 'white', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', opacity: saving ? 0.7 : 1 }}>
                {saving ? '⏳ Saving…' : 'Save Assessment'}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Reporter */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#e8eaf0' }}>Reporter</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#4ade80', flexShrink: 0 }}>
                {incident.reportedBy?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#e8eaf0' }}>{incident.reportedBy?.name || '—'}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#8892a4' }}>{incident.reportedBy?.department || 'Worker'}</p>
              </div>
            </div>
            <InfoRow label="Email" value={incident.reportedBy?.email} />
            <InfoRow label="Phone" value={incident.reportedBy?.phone} />
          </div>

          {/* Priority */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#e8eaf0' }}>Set Priority</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {PRIORITIES.map(p => {
                const isActive = selectedPriority === p;
                const s = PRIORITY_COLORS[p];
                return (
                  <button key={p} onClick={() => isActionable && handleUpdatePriority(p)} disabled={!isActionable}
                    style={{ padding: '8px', borderRadius: '8px', cursor: isActionable ? 'pointer' : 'not-allowed', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize', transition: 'all 0.15s', opacity: isActionable ? 1 : 0.5, ...(isActive ? s.active : s.idle) }}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Info */}
          {incident.supervisorReview?.reviewedBy && (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#e8eaf0' }}>Review Info</h3>
              <InfoRow label="Reviewed By" value={incident.supervisorReview.reviewedBy?.name} />
              {incident.supervisorReview.reviewedAt && (
                <InfoRow label="Reviewed At" value={new Date(incident.supervisorReview.reviewedAt).toLocaleString()} />
              )}
              {incident.supervisorReview.assessment && (
                <InfoRow label="Assessment" value={incident.supervisorReview.assessment} />
              )}
            </div>
          )}

          {/* Timeline */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#e8eaf0' }}>Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { dot: '#3b82f6', label: 'Reported', date: incident.createdAt, show: true },
                { dot: '#f59e0b', label: 'Reviewed by Supervisor', date: incident.supervisorReview?.reviewedAt, show: !!incident.supervisorReview?.reviewedAt },
                { dot: '#4ade80', label: 'Forwarded to Safety Officer', date: incident.forwardInfo?.forwardedAt, show: !!incident.forwardInfo?.forwardedAt },
                { dot: '#ef4444', label: 'Rejected', date: incident.rejectionInfo?.rejectedAt, show: !!incident.rejectionInfo?.rejectedAt },
              ].filter(t => t.show).map((t, i, arr) => (
                <div key={t.label} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.dot, marginTop: '2px', flexShrink: 0 }} />
                    {i < arr.length - 1 && <div style={{ width: '2px', flex: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: i < arr.length - 1 ? '16px' : 0 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#e8eaf0' }}>{t.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#8892a4' }}>
                      {new Date(t.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forward Modal */}
      <Modal isOpen={forwardModal} onClose={() => setForwardModal(false)} title="✅ Forward to Safety Officer">
        <p style={{ fontSize: '13px', color: '#8892a4', marginBottom: '16px' }}>
          This incident will be forwarded to the Safety Officer for investigation.
        </p>

        {suggestedOfficer && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ color: '#4ade80', fontSize: '11px', fontWeight: '700', margin: '0 0 4px', textTransform: 'uppercase' }}>
              ⭐ Suggested Officer — Matched by Domain
            </p>
            <p style={{ color: '#e8eaf0', fontSize: '14px', fontWeight: '600', margin: 0 }}>
              {suggestedOfficer.name}
            </p>
            <p style={{ color: '#8892a4', fontSize: '12px', margin: '2px 0 0' }}>
              {suggestedOfficer.department} • {suggestedOfficer.specialization?.replace(/_/g, ' ')}
            </p>
          </div>
        )}

        {/* ✅ FIXED: Dark background select so options are visible */}
        {allOfficers.length > 0 && (
          <>
            <label style={{ display: 'block', fontSize: '12px', color: '#8892a4', marginBottom: '6px' }}>
              Assign to Safety Officer
            </label>
            <select
              value={selectedOfficerId}
              onChange={e => setSelectedOfficerId(e.target.value)}
              style={selectStyle}
            >
              <option value="" style={{ background: '#0f1729', color: '#8892a4' }}>
                Select officer manually…
              </option>
              {allOfficers.map(o => (
                <option key={o._id} value={o._id} style={{ background: '#0f1729', color: '#e8eaf0' }}>
                  {o.name} — {o.specialization?.replace(/_/g, ' ') || 'No domain'} ({o.department})
                </option>
              ))}
            </select>
          </>
        )}

        <label style={{ display: 'block', fontSize: '12px', color: '#8892a4', marginBottom: '6px' }}>Note for Safety Officer (optional)</label>
        <textarea value={forwardNote} onChange={e => setForwardNote(e.target.value)}
          rows={3} placeholder="Any specific instructions…"
          style={{ ...inputStyle, resize: 'vertical', marginBottom: '16px' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={() => setForwardModal(false)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#e8eaf0', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            Cancel
          </button>
          <button onClick={handleForward} disabled={saving}
            style={{ background: '#16a34a', border: 'none', color: 'white', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', opacity: saving ? 0.7 : 1 }}>
            {saving ? '⏳ Forwarding…' : '✅ Confirm Forward'}
          </button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="❌ Reject Incident">
        <p style={{ fontSize: '13px', color: '#8892a4', marginBottom: '12px' }}>Worker will be notified of the rejection with your reason.</p>
        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
          rows={3} placeholder="Reason for rejection…"
          style={{ ...inputStyle, resize: 'vertical', marginBottom: '16px' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={() => setRejectModal(false)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#e8eaf0', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            Cancel
          </button>
          <button onClick={handleReject} disabled={saving || !rejectReason.trim()}
            style={{ background: '#dc2626', border: 'none', color: 'white', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', opacity: (saving || !rejectReason.trim()) ? 0.5 : 1 }}>
            {saving ? '⏳ Rejecting…' : '❌ Reject Incident'}
          </button>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={reportModal} onClose={() => setReportModal(false)} title="📋 Send Report to Management">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#8892a4', marginBottom: '6px' }}>Summary</label>
            <input type="text" value={reportSummary} onChange={e => setReportSummary(e.target.value)}
              placeholder="Brief summary…" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#8892a4', marginBottom: '6px' }}>Report Content *</label>
            <textarea value={reportContent} onChange={e => setReportContent(e.target.value)}
              rows={5} placeholder="Detailed report…"
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={() => setReportModal(false)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#e8eaf0', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            Cancel
          </button>
          <button onClick={handleSendReport} disabled={saving || !reportContent.trim()}
            style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', opacity: (saving || !reportContent.trim()) ? 0.5 : 1 }}>
            {saving ? '⏳ Sending…' : '📋 Send Report'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default IncidentDetailPage;
