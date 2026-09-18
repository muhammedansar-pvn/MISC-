import apiClient from '../api/axios';

// --- ACADEMIC YEARS ---
export const getAcademicYears = async () => {
  const response = await apiClient.get('/academics/academic-years');
  return response.data;
};

export const getAcademicYearById = async (id) => {
  const response = await apiClient.get(`/academics/academic-years/${id}`);
  return response.data;
};

export const createAcademicYear = async (data) => {
  const response = await apiClient.post('/academics/academic-years', data);
  return response.data;
};

export const updateAcademicYear = async (id, data) => {
  const response = await apiClient.put(`/academics/academic-years/${id}`, data);
  return response.data;
};

// --- CLASSES ---
export const getClasses = async (params = {}) => {
  const response = await apiClient.get('/academics/classes', { params });
  return response.data;
};

export const getClassById = async (id) => {
  const response = await apiClient.get(`/academics/classes/${id}`);
  return response.data;
};

export const createClass = async (data) => {
  const response = await apiClient.post('/academics/classes', data);
  return response.data;
};

export const updateClass = async (id, data) => {
  const response = await apiClient.put(`/academics/classes/${id}`, data);
  return response.data;
};

// --- SUBJECTS ---
export const getSubjects = async (params = {}) => {
  const response = await apiClient.get('/academics/subjects', { params });
  return response.data;
};

export const getSubjectById = async (id) => {
  const response = await apiClient.get(`/academics/subjects/${id}`);
  return response.data;
};

export const createSubject = async (data) => {
  const response = await apiClient.post('/academics/subjects', data);
  return response.data;
};

export const updateSubject = async (id, data) => {
  const response = await apiClient.put(`/academics/subjects/${id}`, data);
  return response.data;
};

// --- SYLLABUSES ---
export const getSyllabuses = async (params = {}) => {
  const response = await apiClient.get('/academics/syllabuses', { params });
  return response.data;
};

export const getSyllabusById = async (id) => {
  const response = await apiClient.get(`/academics/syllabuses/${id}`);
  return response.data;
};

export const createSyllabus = async (data) => {
  const response = await apiClient.post('/academics/syllabuses', data);
  return response.data;
};

export const updateSyllabus = async (id, data) => {
  const response = await apiClient.put(`/academics/syllabuses/${id}`, data);
  return response.data;
};

export default {
  getAcademicYears,
  getAcademicYearById,
  createAcademicYear,
  updateAcademicYear,
  getClasses,
  getClassById,
  createClass,
  updateClass,
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  getSyllabuses,
  getSyllabusById,
  createSyllabus,
  updateSyllabus,
};
