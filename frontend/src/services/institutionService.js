import apiClient from '../api/axios';

export const getInstitutions = async () => {
  const response = await apiClient.get('/institutions');
  return response.data;
};

export const getInstitutionById = async (id) => {
  const response = await apiClient.get(`/institutions/${id}`);
  return response.data;
};

export const createInstitution = async (data) => {
  const response = await apiClient.post('/institutions', data);
  return response.data;
};

export const updateInstitution = async (id, data) => {
  const response = await apiClient.put(`/institutions/${id}`, data);
  return response.data;
};

export default {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
};
