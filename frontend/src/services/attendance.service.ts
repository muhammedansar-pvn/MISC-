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

export default {
  getStudentAttendanceOverview,
  getStudentMonthlyAttendance,
  getStudentAttendanceHistory,
};
