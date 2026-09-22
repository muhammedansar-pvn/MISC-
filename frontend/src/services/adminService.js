import apiClient from '../api/axios';

export const getDashboardStats = async () => {
  const response = await apiClient.get('/admin/stats');
  return response.data;
};

export const getUsers = async (params = {}) => {
  const response = await apiClient.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await apiClient.get(`/admin/users/${id}`);
  return response.data;
};

export const createUserInvitation = async (userData) => {
  const response = await apiClient.post('/admin/users', userData);
  return response.data;
};

export const verifyAdminUserOtp = async (data) => {
  const response = await apiClient.post('/admin/users/verify-otp', data);
  return response.data;
};

export const resendAdminUserOtp = async (data) => {
  const response = await apiClient.post('/admin/users/resend-otp', data);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await apiClient.patch(`/admin/users/${id}`, userData);
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await apiClient.patch(`/admin/users/${id}/status`, { status });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data;
};

export default {
  getDashboardStats,
  getUsers,
  getUserById,
  createUserInvitation,
  verifyAdminUserOtp,
  resendAdminUserOtp,
  updateUser,
  updateUserStatus,
  deleteUser,
};
