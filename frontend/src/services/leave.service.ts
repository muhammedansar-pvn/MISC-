import { apiClient, API_ENDPOINTS } from '@/api/axios';
import { LeaveApplication, LeaveFilterParams, ApiResponse } from '@/types';

/**
 * Fetch leaves for the authenticated user (Student, Parent, Faculty, Admin).
 */
export const getLeaves = async (
  params?: LeaveFilterParams & { studentId?: string; status?: string }
): Promise<ApiResponse<LeaveApplication[]>> => {
  const response = await apiClient.get<ApiResponse<LeaveApplication[]>>(
    API_ENDPOINTS.leaves.list,
    { params }
  );
  return response.data;
};

export const getStudentLeaves = getLeaves;

/**
 * Approve a pending leave request (Faculty).
 */
export const approveLeave = async (
  id: string,
  reviewRemarks?: string
): Promise<ApiResponse<LeaveApplication>> => {
  const response = await apiClient.patch<ApiResponse<LeaveApplication>>(
    API_ENDPOINTS.leaves.approve(id),
    { reviewRemarks }
  );
  return response.data;
};

/**
 * Reject a pending leave request (Faculty).
 */
export const rejectLeave = async (
  id: string,
  reviewRemarks?: string
): Promise<ApiResponse<LeaveApplication>> => {
  const response = await apiClient.patch<ApiResponse<LeaveApplication>>(
    API_ENDPOINTS.leaves.reject(id),
    { reviewRemarks }
  );
  return response.data;
};

export default {
  getLeaves,
  getStudentLeaves,
  approveLeave,
  rejectLeave,
};
