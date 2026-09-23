import { apiClient, API_ENDPOINTS } from '@/api/axios';
import { Institution, InstitutionPayload, ApiResponse } from '@/types';

export const getInstitutions = async (): Promise<ApiResponse<Institution[]>> => {
  const response = await apiClient.get<ApiResponse<Institution[]>>(API_ENDPOINTS.institutions.list);
  return response.data;
};

export const getInstitutionById = async (id: string): Promise<ApiResponse<Institution>> => {
  const response = await apiClient.get<ApiResponse<Institution>>(API_ENDPOINTS.institutions.byId(id));
  return response.data;
};

export const createInstitution = async (data: InstitutionPayload): Promise<ApiResponse<Institution>> => {
  const response = await apiClient.post<ApiResponse<Institution>>(API_ENDPOINTS.institutions.list, data);
  return response.data;
};

export const updateInstitution = async (
  id: string,
  data: Partial<InstitutionPayload>
): Promise<ApiResponse<Institution>> => {
  const response = await apiClient.put<ApiResponse<Institution>>(API_ENDPOINTS.institutions.byId(id), data);
  return response.data;
};

export default {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
};
