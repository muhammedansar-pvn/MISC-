import apiClient from '../api/axios';

export const getFacultyMembers = async (params = {}) => {
  const response = await apiClient.get('/faculty', { params });
  return response.data;
};

export const getFacultyById = async (id) => {
  const response = await apiClient.get(`/faculty/${id}`);
  return response.data;
};

export const createFaculty = async (data) => {
  const response = await apiClient.post('/faculty', data);
  return response.data;
};

export const updateFaculty = async (id, data) => {
  const response = await apiClient.put(`/faculty/${id}`, data);
  return response.data;
};

export default {
  getFacultyMembers,
  getFacultyById,
  createFaculty,
  updateFaculty,
};
