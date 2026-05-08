import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// ─── Safe date parser ─────────────────────────────────────────────────────────
const safeDate = (date) => {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return isValid(d) ? d : null;
};

export const formatDate = (date) => {
  const d = safeDate(date);
  if (!d) return 'N/A';
  return format(d, 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
  const d = safeDate(date);
  if (!d) return 'N/A';
  return format(d, 'dd MMM yyyy, hh:mm a');
};

export const formatTimeAgo = (date) => {
  const d = safeDate(date);
  if (!d) return 'N/A';
  return formatDistanceToNow(d, { addSuffix: true });
};

// ─── String Formatters ────────────────────────────────────────────────────────
export const formatRole = (role) => {
  const map = {
    worker:         'Worker',
    supervisor:     'Supervisor',
    safety_officer: 'Safety Officer',
    management:     'Management',
  };
  return map[role] || role || 'N/A';
};

export const formatIncidentType = (type) => {
  const map = {
    near_miss:       'Near Miss',
    injury:          'Injury',
    property_damage: 'Property Damage',
    environmental:   'Environmental',
    fire:            'Fire',
    chemical_spill:  'Chemical Spill',
    other:           'Other',
  };
  return map[type] || type || 'N/A';
};

export const formatStatus = (status) => {
  const map = {
    draft:        'Draft',
    submitted:    'Submitted',
    under_review: 'Under Review',
    assigned:     'Assigned',
    investigating:'Investigating',
    resolved:     'Resolved',
    closed:       'Closed',
    rejected:     'Rejected',
  };
  return map[status] || status || 'N/A';
};