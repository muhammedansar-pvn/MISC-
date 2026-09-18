import apiClient from '../api/axios';

// --- ARTICLES ---
export const getArticles = async (params = {}) => {
  const response = await apiClient.get('/cms/articles', { params });
  return response.data;
};

export const getArticleBySlug = async (slug) => {
  const response = await apiClient.get(`/cms/articles/${slug}`);
  return response.data;
};

export const createArticle = async (data) => {
  const response = await apiClient.post('/cms/articles', data);
  return response.data;
};

export const updateArticle = async (id, data) => {
  const response = await apiClient.put(`/cms/articles/${id}`, data);
  return response.data;
};

export const deleteArticle = async (id) => {
  const response = await apiClient.delete(`/cms/articles/${id}`);
  return response.data;
};

// --- DOWNLOAD RESOURCES ---
export const getResources = async (params = {}) => {
  const response = await apiClient.get('/cms/resources', { params });
  return response.data;
};

export const createResource = async (data) => {
  const response = await apiClient.post('/cms/resources', data);
  return response.data;
};

export const updateResource = async (id, data) => {
  const response = await apiClient.put(`/cms/resources/${id}`, data);
  return response.data;
};

export const deleteResource = async (id) => {
  const response = await apiClient.delete(`/cms/resources/${id}`);
  return response.data;
};

// --- ENQUIRIES ---
export const getEnquiries = async (params = {}) => {
  const response = await apiClient.get('/cms/enquiries', { params });
  return response.data;
};

export const createEnquiry = async (data) => {
  const response = await apiClient.post('/cms/enquiries', data);
  return response.data;
};

export const updateEnquiryStatus = async (id, status) => {
  const response = await apiClient.put(`/cms/enquiries/${id}/status`, { status });
  return response.data;
};

export default {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getResources,
  createResource,
  updateResource,
  deleteResource,
  getEnquiries,
  createEnquiry,
  updateEnquiryStatus,
};
