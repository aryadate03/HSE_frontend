import axios from 'axios';
import { getToken, removeToken, removeUser } from '../utils/helpers';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — attach token ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle 401 ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      removeUser();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Supervisor ───────────────────────────────────────────────────────────────
export const supervisorAPI = {
  getDashboard:            ()         => api.get('/supervisor/dashboard'),
  getStatistics:           ()         => api.get('/supervisor/statistics'),

  getIncidents:            (params)   => api.get('/supervisor/incidents', { params }),
  getIncident:             (id)       => api.get(`/supervisor/incidents/${id}`),
  addAssessment:           (id, data) => api.put(`/supervisor/incidents/${id}/assessment`, data),
  updatePriority:          (id, data) => api.put(`/supervisor/incidents/${id}/priority`, data),
  assignIncident:          (id, data) => api.put(`/supervisor/incidents/${id}/assign`, data),
  addComment:              (id, data) => api.post(`/supervisor/incidents/${id}/comments`, data),
  markReviewed:            (id, data) => api.put(`/supervisor/incidents/${id}/review`, data),
  rejectIncident:          (id, data) => api.put(`/supervisor/incidents/${id}/reject`, data),
  escalateIncident:        (id, data) => api.put(`/supervisor/incidents/${id}/escalate`, data),
  forwardToSafetyOfficer:  (id, data) => api.put(`/supervisor/incidents/${id}/forward`, data),
  getSuggestedOfficer:     (id)       => api.get(`/supervisor/incidents/${id}/suggested-officer`), // ✅ NEW
  sendReport:              (id, data) => api.post(`/supervisor/incidents/${id}/report`, data),

  getTeam:                 ()         => api.get('/supervisor/team'),
};

export default api;