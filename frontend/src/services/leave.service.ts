import { apiClient, API_ENDPOINTS } from '@/api/axios';
import { LeaveApplication, LeaveFilterParams, ApiResponse } from '@/types';

/**
 * Fetch leaves for the authenticated student.
 * Note: Backend automatically scopes results to req.user.studentId when role=STUDENT.
 */
export const getStudentLeaves = async (
  params?: LeaveFilterParams
): Promise<ApiResponse<LeaveApplication[]>> => {
  const response = await apiClient.get<ApiResponse<LeaveApplication[]>>(
    API_ENDPOINTS.leaves.list,
    { params }
  );
  return response.data;
};

export default {
  getStudentLeaves,
};
