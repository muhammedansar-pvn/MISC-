import apiClient from '../api/axios';

// --- EXAMS ---
export const getExams = async (params = {}) => {
  const response = await apiClient.get('/exams/exams', { params });
  return response.data;
};

export const getExamById = async (id) => {
  const response = await apiClient.get(`/exams/exams/${id}`);
  return response.data;
};

export const createExam = async (data) => {
  const response = await apiClient.post('/exams/exams', data);
  return response.data;
};

export const updateExam = async (id, data) => {
  const response = await apiClient.put(`/exams/exams/${id}`, data);
  return response.data;
};

// --- EXAM SCHEDULES ---
export const getExamSchedules = async (params = {}) => {
  const response = await apiClient.get('/exams/exam-schedules', { params });
  return response.data;
};

export const createExamSchedule = async (data) => {
  const response = await apiClient.post('/exams/exam-schedules', data);
  return response.data;
};

export const updateExamSchedule = async (id, data) => {
  const response = await apiClient.put(`/exams/exam-schedules/${id}`, data);
  return response.data;
};

// --- EXAM REGISTRATIONS ---
export const getExamRegistrations = async (params = {}) => {
  const response = await apiClient.get('/exams/exam-registrations', { params });
  return response.data;
};

export const registerStudentForExam = async (data) => {
  const response = await apiClient.post('/exams/exam-registrations', data);
  return response.data;
};

export const updateExamRegistrationStatus = async (id, status) => {
  const response = await apiClient.put(`/exams/exam-registrations/${id}/status`, { registrationStatus: status });
  return response.data;
};

// --- MARK ENTRIES ---
export const getMarkEntries = async (params = {}) => {
  const response = await apiClient.get('/exams/mark-entries', { params });
  return response.data;
};

export const submitMarkEntry = async (data) => {
  const response = await apiClient.post('/exams/mark-entries', data);
  return response.data;
};

export const verifyMarkEntries = async (examScheduleId) => {
  const response = await apiClient.put(`/exams/mark-entries/verify/${examScheduleId}`);
  return response.data;
};

// --- EXAM RESULTS ---
export const generateExamResults = async (data) => {
  const response = await apiClient.post('/exams/exam-results/generate', data);
  return response.data;
};

export const getExamResults = async (params = {}) => {
  const response = await apiClient.get('/exams/exam-results', { params });
  return response.data;
};

export default {
  getExams,
  getExamById,
  createExam,
  updateExam,
  getExamSchedules,
  createExamSchedule,
  updateExamSchedule,
  getExamRegistrations,
  registerStudentForExam,
  updateExamRegistrationStatus,
  getMarkEntries,
  submitMarkEntry,
  verifyMarkEntries,
  generateExamResults,
  getExamResults,
};
