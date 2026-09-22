import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { FacultyProfile, FacultyPayload, ApiResponse, PaginationParams } from '@/types';

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
  data: Partial<FacultyPayload>
): Promise<ApiResponse<FacultyProfile>> => {
  const response = await apiClient.put<ApiResponse<FacultyProfile>>(API_ENDPOINTS.faculty.byId(id), data);
  return response.data;
};

export default {
  getFacultyMembers,
  getFacultyById,
  createFaculty,
  updateFaculty,
};
