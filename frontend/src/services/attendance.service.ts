import { apiClient, API_ENDPOINTS } from '@/api/axios';
import {
  AttendanceOverview,
  StudentMonthlyAttendanceResponse,
  MonthlyAttendanceHistory,
  AttendanceFilterParams,
  ApiResponse,
} from '@/types';

/**
 * Fetch high-level biometric attendance summary for the authenticated student
 */
export const getStudentAttendanceOverview = async (): Promise<ApiResponse<AttendanceOverview>> => {
  const response = await apiClient.get<ApiResponse<AttendanceOverview>>(
    API_ENDPOINTS.attendance.studentSummary
  );
  return response.data;
};

/**
 * Fetch monthly attendance records (daily sessions and subject breakdowns) for a given month
 */
export const getStudentMonthlyAttendance = async (
  params?: AttendanceFilterParams
): Promise<ApiResponse<StudentMonthlyAttendanceResponse>> => {
  const response = await apiClient.get<ApiResponse<StudentMonthlyAttendanceResponse>>(
    API_ENDPOINTS.attendance.studentMonthly,
    { params }
  );
  return response.data;
};

/**
 * Fetch longitudinal monthly attendance history
 */
export const getStudentAttendanceHistory = async (): Promise<ApiResponse<MonthlyAttendanceHistory[]>> => {
  const response = await apiClient.get<ApiResponse<MonthlyAttendanceHistory[]>>(
    API_ENDPOINTS.attendance.studentHistory
  );
  return response.data;
};

export interface MarkClassAttendancePayload {
  classId: string;
  subjectId: string;
  date: string;
  period: number;
  records: Array<{
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'EXCUSED';
    remarks?: string;
  }>;
}

/**
 * Submit or update attendance marks for an entire class roster
 */
export const markClassAttendance = async (
  payload: MarkClassAttendancePayload
): Promise<ApiResponse<{ classId: string; subjectId?: string; date: string; period: number; totalMarked: number }>> => {
  const response = await apiClient.post<ApiResponse<any>>(
    API_ENDPOINTS.attendance.markClass,
    payload
  );
  return response.data;
};

/**
 * Fetch existing attendance marks for a class on a specific date, period, and optional subject
 */
export const getClassAttendanceRecords = async (params: {
  classId: string;
  subjectId?: string;
  date: string;
  period?: number;
}): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    API_ENDPOINTS.attendance.classRecords,
    { params }
  );
  return response.data;
};

export interface CreateCorrectionRequestPayload {
  studentId: string;
  classId: string;
  subjectId?: string;
  academicYearId?: string;
  date: string;
  period: number;
  currentStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'EXCUSED';
  requestedStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'EXCUSED';
  reason: string;
}

/**
 * Fetch subject-wise aggregated attendance for a student
 */
export const getStudentSubjectAttendance = async (params?: {
  studentId?: string;
  academicYearId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    API_ENDPOINTS.attendance.studentSubjects,
    { params }
  );
  return response.data;
};

/**
 * Fetch session-wise (Period 1..7) aggregated attendance for a student
 */
export const getStudentSessionAttendance = async (params?: {
  studentId?: string;
  academicYearId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    API_ENDPOINTS.attendance.studentSessions,
    { params }
  );
  return response.data;
};

/**
 * Fetch aggregate class attendance statistics
 */
export const getClassAttendanceSummary = async (params: {
  classId: string;
  subjectId?: string;
  date?: string;
  period?: number;
}): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>(
    API_ENDPOINTS.attendance.classSummary,
    { params }
  );
  return response.data;
};

/**
 * Fetch faculty attendance submission history
 */
export const getFacultyAttendanceSummary = async (params?: {
  startDate?: string;
  endDate?: string;
  classId?: string;
}): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>(
    API_ENDPOINTS.attendance.facultyHistory,
    { params }
  );
  return response.data;
};

/**
 * Submit an attendance correction request
 */
export const createCorrectionRequest = async (
  payload: CreateCorrectionRequestPayload
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>(
    API_ENDPOINTS.attendance.correctionRequests,
    payload
  );
  return response.data;
};

export default {
  getStudentAttendanceOverview,
  getStudentMonthlyAttendance,
  getStudentAttendanceHistory,
  getStudentSubjectAttendance,
  getStudentSessionAttendance,
  markClassAttendance,
  getClassAttendanceRecords,
  getClassAttendanceSummary,
  getFacultyAttendanceSummary,
  createCorrectionRequest,
};

