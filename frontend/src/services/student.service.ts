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
): Promise<ApiResponse<StudentProfile>> => {
  const response = await apiClient.put<ApiResponse<StudentProfile>>(API_ENDPOINTS.students.byId(id), data);
  return response.data;
};

export const getStudentProfile = async (): Promise<ApiResponse<StudentProfile>> => {
  const response = await apiClient.get<ApiResponse<StudentProfile>>(API_ENDPOINTS.students.profile);
  return response.data;
};

export default {
  getStudents,
  getStudentById,
  getStudentProfile,
  registerStudent,
  registerStudentFull,
  updateStudent,
};
