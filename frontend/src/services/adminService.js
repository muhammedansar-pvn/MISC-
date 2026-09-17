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

export default {
  getDashboardStats,
  getUsers,
  getUserById,
  createUserInvitation,
};
