import { apiClient, API_ENDPOINTS } from '@/lib/api';
import {
  Exam,
  ExamPayload,
  ExamSchedule,
  ExamSchedulePayload,
  ExamRegistration,
  ExamRegistrationPayload,
  MarkEntry,
  MarkEntryPayload,
  ExamResult,
  ApiResponse,
  PaginationParams,
} from '@/types';

// --- EXAMS ---
export const getExams = async (params: PaginationParams = {}): Promise<ApiResponse<Exam[]>> => {
  const response = await apiClient.get<ApiResponse<Exam[]>>(API_ENDPOINTS.exams.list, { params });
  return response.data;
};

export const getExamById = async (id: string): Promise<ApiResponse<Exam>> => {
  const response = await apiClient.get<ApiResponse<Exam>>(API_ENDPOINTS.exams.byId(id));
  return response.data;
};

export const createExam = async (data: ExamPayload): Promise<ApiResponse<Exam>> => {
  const response = await apiClient.post<ApiResponse<Exam>>(API_ENDPOINTS.exams.list, data);
  return response.data;
};

export const updateExam = async (id: string, data: Partial<ExamPayload>): Promise<ApiResponse<Exam>> => {
  const response = await apiClient.put<ApiResponse<Exam>>(API_ENDPOINTS.exams.byId(id), data);
  return response.data;
};

// --- EXAM SCHEDULES ---
export const getExamSchedules = async (params: PaginationParams = {}): Promise<ApiResponse<ExamSchedule[]>> => {
  const response = await apiClient.get<ApiResponse<ExamSchedule[]>>(API_ENDPOINTS.exams.schedules, { params });
  return response.data;
};

export const createExamSchedule = async (data: ExamSchedulePayload): Promise<ApiResponse<ExamSchedule>> => {
  const response = await apiClient.post<ApiResponse<ExamSchedule>>(API_ENDPOINTS.exams.schedules, data);
  return response.data;
};

export const updateExamSchedule = async (
  id: string,
  data: Partial<ExamSchedulePayload>
): Promise<ApiResponse<ExamSchedule>> => {
  const response = await apiClient.put<ApiResponse<ExamSchedule>>(API_ENDPOINTS.exams.scheduleById(id), data);
  return response.data;
};

// --- EXAM REGISTRATIONS ---
export const getExamRegistrations = async (
  params: PaginationParams = {}
): Promise<ApiResponse<ExamRegistration[]>> => {
  const response = await apiClient.get<ApiResponse<ExamRegistration[]>>(API_ENDPOINTS.exams.registrations, { params });
  return response.data;
};

export const registerStudentForExam = async (
  data: ExamRegistrationPayload
): Promise<ApiResponse<ExamRegistration>> => {
  const response = await apiClient.post<ApiResponse<ExamRegistration>>(API_ENDPOINTS.exams.registrations, data);
  return response.data;
};

export const updateExamRegistrationStatus = async (
  id: string,
  status: string
): Promise<ApiResponse<ExamRegistration>> => {
  const response = await apiClient.put<ApiResponse<ExamRegistration>>(
    API_ENDPOINTS.exams.registrationStatus(id),
    { registrationStatus: status }
  );
  return response.data;
};

// --- MARK ENTRIES ---
export const getMarkEntries = async (params: PaginationParams = {}): Promise<ApiResponse<MarkEntry[]>> => {
  const response = await apiClient.get<ApiResponse<MarkEntry[]>>(API_ENDPOINTS.exams.markEntries, { params });
  return response.data;
};

export const submitMarkEntry = async (data: MarkEntryPayload): Promise<ApiResponse<MarkEntry>> => {
  const response = await apiClient.post<ApiResponse<MarkEntry>>(API_ENDPOINTS.exams.markEntries, data);
  return response.data;
};

export const verifyMarkEntries = async (examScheduleId: string): Promise<ApiResponse> => {
  const response = await apiClient.put<ApiResponse>(API_ENDPOINTS.exams.verifyMarkEntries(examScheduleId));
  return response.data;
};

// --- EXAM RESULTS ---
export const generateExamResults = async (data: {
  examId: string;
  classId?: string;
  [key: string]: any;
}): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.exams.generateResults, data);
  return response.data;
};

export const getExamResults = async (params: PaginationParams = {}): Promise<ApiResponse<ExamResult[]>> => {
  const response = await apiClient.get<ApiResponse<ExamResult[]>>(API_ENDPOINTS.exams.results, { params });
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
