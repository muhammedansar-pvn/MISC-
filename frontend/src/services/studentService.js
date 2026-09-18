import apiClient from '../api/axios';

export const getStudents = async (params = {}) => {
  const response = await apiClient.get('/students', { params });
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await apiClient.get(`/students/${id}`);
  return response.data;
};

export const registerStudent = async (data) => {
  const response = await apiClient.post('/students', data);
  return response.data;
};

export const updateStudent = async (id, data) => {
  const response = await apiClient.put(`/students/${id}`, data);
  return response.data;
};

export default {
  getStudents,
  getStudentById,
  registerStudent,
  updateStudent,
};
