import { apiClient, API_ENDPOINTS } from '@/api/axios';
import {
  Exam,
  ExamPayload,
  ExamSchedule,
  ExamSchedulePayload,
  ExamRegistration,
  ExamRegistrationPayload,
  AvailableExamForRegistration,
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

export const publishExam = async (id: string, published: boolean = true): Promise<ApiResponse<Exam>> => {
  const response = await apiClient.patch<ApiResponse<Exam>>(API_ENDPOINTS.exams.publish(id), {
    status: published ? 'PUBLISHED' : 'DRAFT',
    isPublished: published,
  });
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
export const getAvailableExamsForRegistration = async (
  params: { studentId?: string } = {}
): Promise<ApiResponse<AvailableExamForRegistration[]>> => {
  const response = await apiClient.get<ApiResponse<AvailableExamForRegistration[]>>(
    API_ENDPOINTS.exams.availableForRegistration,
    { params }
  );
  return response.data;
};

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

export interface ExamFeePaymentCheckResponse {
  isPaid: boolean;
  status: 'PAID' | 'PENDING' | 'UNPAID';
  payment: any;
  registration: ExamRegistration;
  message: string;
}

export const getExamRegistrationById = async (
  id: string
): Promise<ApiResponse<ExamRegistration>> => {
  const response = await apiClient.get<ApiResponse<ExamRegistration>>(
    API_ENDPOINTS.exams.registrationById(id)
  );
  return response.data;
};

export const checkExamFeePayment = async (
  id: string
): Promise<ApiResponse<ExamFeePaymentCheckResponse>> => {
  const response = await apiClient.get<ApiResponse<ExamFeePaymentCheckResponse>>(
    API_ENDPOINTS.exams.registrationPayment(id)
  );
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

// --- FACULTY SCOPED SCHEDULES & ROSTER MARKS ---
export const getFacultyExamSchedules = async (params: any = {}): Promise<ApiResponse<ExamSchedule[]>> => {
  const response = await apiClient.get<ApiResponse<ExamSchedule[]>>(API_ENDPOINTS.exams.facultySchedules, { params });
  return response.data;
};

export interface ExamScheduleRosterResponse {
  schedule: ExamSchedule;
  roster: Array<{
    studentId: string;
    studentName: string;
    registrationNumber: string;
    admissionNumber: string;
    markEntryId: string | null;
    marksObtained: number | null;
    isAbsent: boolean;
    status: 'NOT_ENTERED' | 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'PUBLISHED';
    remarks?: string;
  }>;
}

export const getExamScheduleRoster = async (
  examScheduleId: string
): Promise<ApiResponse<ExamScheduleRosterResponse>> => {
  const response = await apiClient.get<ApiResponse<ExamScheduleRosterResponse>>(
    API_ENDPOINTS.exams.scheduleRoster(examScheduleId)
  );
  return response.data;
};

export interface SubmitRosterMarksPayload {
  status?: 'DRAFT' | 'SUBMITTED';
  marks: Array<{
    studentId: string;
    marksObtained: number;
    isAbsent?: boolean;
    remarks?: string;
  }>;
}

export const submitRosterMarks = async (
  examScheduleId: string,
  payload: SubmitRosterMarksPayload
): Promise<ApiResponse<{ totalProcessed: number; status: string }>> => {
  const response = await apiClient.post<ApiResponse<any>>(
    API_ENDPOINTS.exams.submitRosterMarks(examScheduleId),
    payload
  );
  return response.data;
};

// --- MARK CORRECTION REQUESTS ---
export const createMarkCorrectionRequest = async (payload: {
  markEntryId: string;
  newMarks: number;
  reason: string;
}): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>(
    API_ENDPOINTS.exams.markCorrections,
    payload
  );
  return response.data;
};

export const reviewMarkCorrectionRequest = async (
  id: string,
  payload: { status: 'APPROVED' | 'REJECTED'; adminRemarks?: string }
): Promise<ApiResponse<any>> => {
  const response = await apiClient.patch<ApiResponse<any>>(
    API_ENDPOINTS.exams.reviewMarkCorrection(id),
    payload
  );
  return response.data;
};

export default {
  getExams,
  getExamById,
  createExam,
  updateExam,
  getExamSchedules,
  getFacultyExamSchedules,
  getExamScheduleRoster,
  submitRosterMarks,
  createExamSchedule,
  updateExamSchedule,
  getExamRegistrations,
  getExamRegistrationById,
  checkExamFeePayment,
  registerStudentForExam,
  updateExamRegistrationStatus,
  getMarkEntries,
  submitMarkEntry,
  verifyMarkEntries,
  createMarkCorrectionRequest,
  reviewMarkCorrectionRequest,
  generateExamResults,
  getExamResults,
};
