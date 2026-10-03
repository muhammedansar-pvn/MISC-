import { apiClient, API_ENDPOINTS } from '@/api/axios';
import {
  FacultyProfile,
  FacultyPayload,
  FacultyAssignment,
  FacultyClassView,
  ApiResponse,
  PaginationParams,
} from '@/types';

export const getFacultyMembers = async (params: PaginationParams = {}): Promise<ApiResponse<FacultyProfile[]>> => {
  const response = await apiClient.get<ApiResponse<FacultyProfile[]>>(API_ENDPOINTS.faculty.list, { params });
  return response.data;
};

export const getFacultyById = async (id: string): Promise<ApiResponse<FacultyProfile>> => {
  const response = await apiClient.get<ApiResponse<FacultyProfile>>(API_ENDPOINTS.faculty.byId(id));
  return response.data;
};

export const createFaculty = async (data: FacultyPayload): Promise<ApiResponse<FacultyProfile>> => {
  const response = await apiClient.post<ApiResponse<FacultyProfile>>(API_ENDPOINTS.faculty.list, data);
  return response.data;
};

export const updateFaculty = async (
  id: string,
  data: Partial<FacultyPayload> & { email?: string }
): Promise<ApiResponse<FacultyProfile & { requiresEmailVerification?: boolean; maskedEmail?: string }>> => {
  const response = await apiClient.put<ApiResponse<FacultyProfile & { requiresEmailVerification?: boolean; maskedEmail?: string }>>(API_ENDPOINTS.faculty.byId(id), data);
  return response.data;
};

export const updateFacultyStatus = async (
  id: string,
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
): Promise<ApiResponse<FacultyProfile>> => {
  const response = await apiClient.patch<ApiResponse<FacultyProfile>>(API_ENDPOINTS.faculty.status(id), { status });
  return response.data;
};

export const deleteFaculty = async (id: string): Promise<ApiResponse<FacultyProfile>> => {
  const response = await apiClient.delete<ApiResponse<FacultyProfile>>(API_ENDPOINTS.faculty.byId(id));
  return response.data;
};

export const getFacultyDashboardStats = async (): Promise<ApiResponse<{
  assignedClassesCount: number;
  assignedSubjectsCount: number;
  totalStudentsCount: number;
  todayClassesCount: number;
  todayTimetable: any[];
  unmarkedAttendanceCount: number;
  pendingAssignmentsCount: number;
  pendingLeavesCount: number;
  todayDayOfWeek: string;
}>> => {
  const response = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.faculty.dashboardStats);
  return response.data;
};

export const getMyAssignments = async (
  academicYearId?: string
): Promise<ApiResponse<FacultyAssignment[]>> => {
  const response = await apiClient.get<ApiResponse<FacultyAssignment[]>>(
    API_ENDPOINTS.faculty.myAssignments,
    { params: academicYearId ? { academicYearId } : {} }
  );
  return response.data;
};

export const getMyClasses = async (
  academicYearId?: string
): Promise<ApiResponse<FacultyClassView[]>> => {
  const response = await apiClient.get<ApiResponse<FacultyClassView[]>>(
    API_ENDPOINTS.faculty.myClasses,
    { params: academicYearId ? { academicYearId } : {} }
  );
  return response.data;
};

export const getFacultyMyTimetable = async (): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(API_ENDPOINTS.faculty.myTimetable);
  return response.data;
};

export const getMyStudents = async (classId?: string): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    API_ENDPOINTS.faculty.myStudents,
    { params: classId ? { classId } : {} }
  );
  return response.data;
};

export const getFacultyStudent360 = async (id: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.faculty.student360(id));
  return response.data;
};

export const createFacultyRemark = async (
  id: string,
  data: { category?: string; remark: string; subjectId?: string }
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>(
    API_ENDPOINTS.faculty.studentRemarks(id),
    data
  );
  return response.data;
};

export const getFacultyRemarks = async (id: string): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    API_ENDPOINTS.faculty.studentRemarks(id)
  );
  return response.data;
};

export default {
  getFacultyMembers,
  getFacultyById,
  createFaculty,
  updateFaculty,
  updateFacultyStatus,
  deleteFaculty,
  getFacultyDashboardStats,
  getMyAssignments,
  getMyClasses,
  getFacultyMyTimetable,
  getMyStudents,
  getFacultyStudent360,
  createFacultyRemark,
  getFacultyRemarks,
};
