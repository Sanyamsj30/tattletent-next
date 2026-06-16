import api from './axiosInstance';

export const sendOtp = (email) => 
  api.post('/api/auth/send-otp', { email }).then(res => res.data);

export const registerUser = (payload) => 
  api.post('/api/auth/register', payload).then(res => res.data);

export const loginUser = (email, password) => 
  api.post('/api/auth/login', { email, password }).then(res => res.data);

export const checkEmailExists = (email) => 
  api.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`).then(res => res.data);

export const sendResetOtp = (email) => 
  api.post('/api/auth/send-reset-otp', { email }).then(res => res.data);

export const resetPassword = (email, otp, newPassword) => 
  api.post('/api/auth/reset-password', { email, otp, newPassword }).then(res => res.data);

export const fetchCurrentUser = () => 
  api.get('/api/auth/me').then(res => res.data);

export const changePassword = (oldPassword, newPassword) => 
  api.put('/api/auth/change-password', { oldPassword, newPassword }).then(res => res.data);

export const adminCreateStaff = (payload) => 
  api.post('/api/auth/admin/create-staff', payload).then(res => res.data);
