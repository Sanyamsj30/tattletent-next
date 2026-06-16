import api from './axiosInstance';

// Public endpoints
export const fetchPublicComplaintCounts = () => 
  api.get('/api/public/complaints/counts').then(res => res.data);

export const searchPublicComplaints = (queryParams = '') => 
  api.get(`/api/public/complaints/search?${queryParams}`).then(res => res.data);

// Protected endpoints
export const fetchComplaintCounts = () => 
  api.get('/api/complaints/counts').then(res => res.data);

export const searchComplaints = (queryParams = '') => 
  api.get(`/api/complaints/search?${queryParams}`).then(res => res.data);

export const fetchMapMarkers = (queryParams = '') => 
  api.get(`/api/complaints/map-markers?${queryParams}`).then(res => res.data);

export const fetchNearbyComplaints = (queryParams = '') => 
  api.get(`/api/complaints/nearby?${queryParams}`).then(res => res.data);

export const supportComplaint = (id) => 
  api.post(`/api/complaints/support/${id}`).then(res => res.data);

export const updateComplaintStatus = (id, payload) => 
  api.put(`/api/complaints/status/${id}`, payload).then(res => res.data);

export const reassignComplaint = (id, payload) => 
  api.put(`/api/complaints/reassign/${id}`, payload).then(res => res.data);

export const updateComplaintPriority = (id, priority) => 
  api.put(`/api/complaints/priority/${id}`, { priority }).then(res => res.data);

export const forceEscalateComplaint = (id, reason) => 
  api.post(`/api/complaints/force-escalate/${id}`, { reason }).then(res => res.data);

export const createComplaint = (formData) => 
  api.post('/api/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);

export const deleteComplaint = (id) => 
  api.delete(`/api/complaints/${id}`).then(res => res.data);
