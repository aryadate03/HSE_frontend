import api from './api';

const incidentService = {
  // Create incident (draft or submit)
  createIncident: (formData) =>
    api.post('/worker/incidents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Get my reports with filters + pagination
  getMyReports: (params) => api.get('/worker/incidents', { params }),

  // Get single incident by ID
  getIncidentById: (id) => api.get(`/worker/incidents/${id}`),

  // Update draft
  updateDraft: (id, data) => api.put(`/worker/incidents/${id}/draft`, data),

  // Submit a saved draft
  submitIncident: (id) => api.put(`/worker/incidents/${id}/submit`),

  // Upload photos to existing incident
  uploadPhotos: (id, formData) =>
    api.post(`/worker/incidents/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete a photo
  deletePhoto: (id, photoId) =>
    api.delete(`/worker/incidents/${id}/photos/${photoId}`),

  // Worker dashboard stats
  getDashboard: () => api.get('/worker/dashboard'),
};

export default incidentService;