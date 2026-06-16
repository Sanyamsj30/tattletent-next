import api from './axiosInstance';

export const fetchPublicFeedback = () => 
  api.get('/api/public/feedback').then(res => res.data);

export const submitFeedback = (payload) => 
  api.post('/api/feedback', payload).then(res => res.data);
