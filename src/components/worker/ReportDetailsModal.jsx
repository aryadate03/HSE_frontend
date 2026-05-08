import Modal from '../common/Modal';
import Badge from '../common/Badge';
import PhotoGallery from '../common/PhotoGallery';
import StatusTimeline from '../common/StatusTimeline';
import { STATUS_COLORS, STATUS_LABELS, SEVERITY_COLORS, SEVERITY_LABELS } from '../../utils/constants';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { Printer } from 'lucide-react';

const Row = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="text-sm text-gray-500 w-32 shrink-0">{label}:</span>
    <span className="text-sm text-gray-800 font-medium">{value || 'N/A'}</span>
  </div>
);

const ReportDetailsModal = ({ isOpen, onClose, incident }) => {
  if (!incident) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Incident — ${incident.incidentId}`} size="lg">
      <div className="flex flex-col gap-6">

        {/* Status + Severity */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge label={STATUS_LABELS[incident.status]}   colorClass={STATUS_COLORS[incident.status]} />
          <Badge label={SEVERITY_LABELS[incident.severity]} colorClass={SEVERITY_COLORS[incident.severity]} />
          <button
            onClick={() => window.print()}
            className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <Printer size={16} /> Print
          </button>
        </div>

        {/* Incident Details */}
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Incident Details</h4>
          <Row label="Incident ID"  value={incident.incidentId} />
          <Row label="Type"         value={incident.incidentType?.replace(/_/g, ' ')} />
          <Row label="Date & Time"  value={formatDateTime(incident.dateTime)} />
          <Row label="Reported On"  value={formatDateTime(incident.createdAt)} />
          <Row label="Has Injury"   value={incident.hasInjury === true ? 'Yes' : incident.hasInjury === false ? 'No' : 'N/A'} />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Location</h4>
          <Row label="Building" value={incident.location?.building} />
          <Row label="Floor"    value={incident.location?.floor} />
          <Row label="Zone"     value={incident.location?.zone} />
          <Row label="Address"  value={incident.location?.manualAddress} />
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed">
            {incident.description || 'N/A'}
          </p>
        </div>

        {/* Witnesses */}
        {incident.witnesses?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Witnesses</h4>
            {incident.witnesses.map((w, i) => (
              <div key={i} className="text-sm text-gray-700">
                {w.name} {w.contact && `— ${w.contact}`}
              </div>
            ))}
          </div>
        )}

        {/* Photos */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Photos {incident.photos?.length > 0 ? `(${incident.photos.length})` : ''}
          </h4>
          <PhotoGallery photos={incident.photos || []} />
        </div>

        {/* Timeline */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Status Timeline</h4>
          <StatusTimeline
            currentStatus={incident.status}
            createdAt={incident.createdAt}
            updatedAt={incident.updatedAt}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ReportDetailsModal;