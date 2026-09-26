import { apiClient, API_ENDPOINTS } from '@/api/axios';
import {
  StudentProfile,
  StudentPayload,
  RegisterStudentFullPayload,
  RegisterStudentFullResponse,
  ApiResponse,
  PaginationParams,
} from '@/types';

export const getStudents = async (params: PaginationParams = {}): Promise<ApiResponse<StudentProfile[]>> => {
  const response = await apiClient.get<ApiResponse<StudentProfile[]>>(API_ENDPOINTS.students.list, { params });
  return response.data;
};

export const getStudentById = async (id: string): Promise<ApiResponse<StudentProfile>> => {
  const response = await apiClient.get<ApiResponse<StudentProfile>>(API_ENDPOINTS.students.byId(id));
  return response.data;
};

export const registerStudent = async (data: StudentPayload): Promise<ApiResponse<StudentProfile>> => {
  const response = await apiClient.post<ApiResponse<StudentProfile>>(API_ENDPOINTS.students.list, data);
  return response.data;
};

export const registerStudentFull = async (
  data: RegisterStudentFullPayload
): Promise<ApiResponse<RegisterStudentFullResponse>> => {
  const response = await apiClient.post<ApiResponse<RegisterStudentFullResponse>>(
    API_ENDPOINTS.admin.registerStudent,
    data
  );
  return response.data;
};

export const updateStudent = async (
  id: string,
  data: Partial<StudentPayload>
): Promise<ApiResponse<StudentProfile & { requiresEmailVerification?: boolean; email?: string; maskedEmail?: string; verificationId?: string }>> => {
  const response = await apiClient.put<ApiResponse<any>>(API_ENDPOINTS.students.byId(id), data);
  return response.data;
};

export const getStudentProfile = async (): Promise<ApiResponse<StudentProfile>> => {
  const response = await apiClient.get<ApiResponse<StudentProfile>>(API_ENDPOINTS.students.profile);
  return response.data;
};

export const updateMyProfile = async (
  data: Partial<StudentPayload>
): Promise<ApiResponse<StudentProfile & { requiresEmailVerification?: boolean; email?: string; maskedEmail?: string; verificationId?: string }>> => {
  const response = await apiClient.put<ApiResponse<any>>(
    API_ENDPOINTS.students.profile,
    data
  );
  return response.data;
};

export const updateStudentStatus = async (
  id: string,
  status: string
): Promise<ApiResponse<any>> => {
  const response = await apiClient.patch<ApiResponse<any>>(API_ENDPOINTS.students.status(id), { status });
  return response.data;
};

export const deleteStudent = async (
  id: string,
  permanent = false
): Promise<ApiResponse<any>> => {
  const response = await apiClient.delete<ApiResponse<any>>(API_ENDPOINTS.students.byId(id), {
    params: { permanent: permanent ? 'true' : 'false' },
  });
  return response.data;
};

export default {
  getStudents,
  getStudentById,
  getStudentProfile,
  updateMyProfile,
  registerStudent,
  registerStudentFull,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
};
