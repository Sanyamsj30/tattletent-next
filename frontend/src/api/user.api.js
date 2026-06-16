import api from './axiosInstance';

export const searchUsers = (queryParams = '') => 
  api.get(`/api/users/search?${queryParams}`).then(res => res.data);
