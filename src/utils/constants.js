// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
  WORKER: 'worker',
  SUPERVISOR: 'supervisor',
  SAFETY_OFFICER: 'safety_officer',
  MANAGEMENT: 'management',
};

// ─── Incident Status ──────────────────────────────────────────────────────────
export const INCIDENT_STATUS = {
  DRAFT:                       'draft',
  SUBMITTED:                   'submitted',
  UNDER_REVIEW:                'under_review',
  FORWARDED_TO_SAFETY_OFFICER: 'forwarded_to_safety_officer',
  INVESTIGATING:               'investigating',
  RESOLVED:                    'resolved',
  CLOSED:                      'closed',
  REJECTED:                    'rejected',
};

// ─── Incident Status Labels ───────────────────────────────────────────────────
export const STATUS_LABELS = {
  draft:                       'Draft',
  submitted:                   'Submitted',
  under_review:                'Under Review',
  forwarded_to_safety_officer: 'Approved ✓',       // worker ko simple dikhega
  investigating:               'Being Investigated',
  resolved:                    'Resolved',
  closed:                      'Closed',
  rejected:                    'Rejected ✗',        // worker ko clear dikhega
};

// ─── Status Colors (Tailwind) ─────────────────────────────────────────────────
export const STATUS_COLORS = {
  draft:                       'bg-gray-100 text-gray-600',
  submitted:                   'bg-blue-100 text-blue-600',
  under_review:                'bg-yellow-100 text-yellow-700',
  forwarded_to_safety_officer: 'bg-green-100 text-green-700',  // green = approved
  investigating:               'bg-orange-100 text-orange-600',
  resolved:                    'bg-emerald-100 text-emerald-700',
  closed:                      'bg-gray-100 text-gray-800',
  rejected:                    'bg-red-100 text-red-600',       // red = rejected
};

// ─── Severity ─────────────────────────────────────────────────────────────────
export const SEVERITY = {
  LOW:      'low',
  MEDIUM:   'medium',
  HIGH:     'high',
  CRITICAL: 'critical',
};

export const SEVERITY_LABELS = {
  low:      'Low',
  medium:   'Medium',
  high:     'High',
  critical: 'Critical',
};

export const SEVERITY_COLORS = {
  low:      'bg-green-100 text-green-600',
  medium:   'bg-yellow-100 text-yellow-600',
  high:     'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
};

// ─── Incident Types ───────────────────────────────────────────────────────────
export const INCIDENT_TYPES = [
  { value: 'near_miss',        label: 'Near Miss' },
  { value: 'injury',           label: 'Injury' },
  { value: 'property_damage',  label: 'Property Damage' },
  { value: 'environmental',    label: 'Environmental' },
  { value: 'fire',             label: 'Fire' },
  { value: 'chemical_spill',   label: 'Chemical Spill' },
  { value: 'other',            label: 'Other' },
];

// ─── Priority ─────────────────────────────────────────────────────────────────
export const PRIORITY_COLORS = {
  low:    'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-600',
  high:   'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

// ─── API Base URL ─────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hse-backend-three.vercel.app/api';
