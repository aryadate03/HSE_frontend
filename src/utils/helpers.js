// ─── Token Helpers ────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('hse_token');

export const setToken = (token) => localStorage.setItem('hse_token', token);

export const removeToken = () => localStorage.removeItem('hse_token');

// ─── User Helpers ─────────────────────────────────────────────────────────────
export const getUser = () => {
  const user = localStorage.getItem('hse_user');
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => localStorage.setItem('hse_user', JSON.stringify(user));

export const removeUser = () => localStorage.removeItem('hse_user');

// ─── Role Helpers ─────────────────────────────────────────────────────────────
export const isWorker = (user) => user?.role === 'worker';
export const isSupervisor = (user) => user?.role === 'supervisor';
export const isSafetyOfficer = (user) => user?.role === 'safety_officer';
export const isManagement = (user) => user?.role === 'management';

// ─── Dashboard Route by Role ──────────────────────────────────────────────────
export const getDashboardRoute = (role) => {
  switch (role) {
    case 'worker': return '/worker/dashboard';
    case 'supervisor': return '/supervisor/dashboard';
    case 'safety_officer': return '/safety-officer/dashboard';
    case 'management': return '/management/dashboard';
    default: return '/login';
  }
};

// ─── Truncate Text ────────────────────────────────────────────────────────────
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// ─── Get Initials ─────────────────────────────────────────────────────────────
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};