import { apiClient, API_ENDPOINTS } from '@/api/axios';
import { LeaveApplication, LeaveFilterParams, ApplyLeavePayload, ApiResponse } from '@/types';

/**
 * Fetch leaves for the authenticated user (Student, Parent, Faculty, Admin).
 */
export const getLeaves = async (
  params?: LeaveFilterParams & { studentId?: string; status?: string; classId?: string }
): Promise<ApiResponse<LeaveApplication[]>> => {
  const response = await apiClient.get<ApiResponse<LeaveApplication[]>>(
    API_ENDPOINTS.leaves.list,
    { params }
  );
  return response.data;
};

export const getStudentLeaves = getLeaves;

/**
 * Submit a leave application (Student or Parent).
 */
export const applyLeave = async (
  payload: ApplyLeavePayload
): Promise<ApiResponse<LeaveApplication>> => {
  const response = await apiClient.post<ApiResponse<LeaveApplication>>(
    API_ENDPOINTS.leaves.apply,
    payload
  );
  return response.data;
};

/**
 * Approve a pending leave request (Faculty or Admin).
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
 * Reject a pending leave request (Faculty or Admin).
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
  applyLeave,
  approveLeave,
  rejectLeave,
};
