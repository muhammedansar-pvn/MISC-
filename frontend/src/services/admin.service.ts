import { apiClient, API_ENDPOINTS } from '@/api/axios';
import {
  User,
  UserQueryParams,
  CreateUserInvitationPayload,
  UpdateUserPayload,
  VerifyAdminUserOtpPayload,
  ResendAdminUserOtpPayload,
  DashboardStats,
  ApiResponse,
} from '@/types';

export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  const response = await apiClient.get<ApiResponse<DashboardStats>>(API_ENDPOINTS.admin.stats);
  return response.data;
};

export const getUsers = async (params: UserQueryParams = {}): Promise<ApiResponse<User[]>> => {
  const response = await apiClient.get<ApiResponse<User[]>>(API_ENDPOINTS.admin.users, { params });
  return response.data;
};

export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.admin.userById(id));
  return response.data;
};

export const createUserInvitation = async (userData: CreateUserInvitationPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.admin.users, userData);
  return response.data;
};

export const verifyAdminUserOtp = async (data: VerifyAdminUserOtpPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.admin.verifyOtp, data);
  return response.data;
};

export const resendAdminUserOtp = async (data: ResendAdminUserOtpPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.admin.resendOtp, data);
  return response.data;
};

export const updateUser = async (id: string, userData: UpdateUserPayload): Promise<ApiResponse<User>> => {
  const response = await apiClient.patch<ApiResponse<User>>(API_ENDPOINTS.admin.userById(id), userData);
  return response.data;
};

export const updateUserStatus = async (id: string, status: string): Promise<ApiResponse<User>> => {
  const response = await apiClient.patch<ApiResponse<User>>(API_ENDPOINTS.admin.userStatus(id), { status });
  return response.data;
};

export const deleteUser = async (id: string): Promise<ApiResponse> => {
  const response = await apiClient.delete<ApiResponse>(API_ENDPOINTS.admin.userById(id));
  return response.data;
};

export default {
  getDashboardStats,
  getUsers,
  getUserById,
  createUserInvitation,
  verifyAdminUserOtp,
  resendAdminUserOtp,
  updateUser,
  updateUserStatus,
  deleteUser,
};
