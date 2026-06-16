import api from './axiosInstance';

export const fetchAssignmentRecommendation = (id) => 
  api.get(`/api/ai/recommendation/${id}`).then(res => res.data);

export const callChatbot = (message, history = []) => 
  api.post('/api/ai/chatbot', { message, history }).then(res => res.data);
