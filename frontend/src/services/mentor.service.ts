import { apiClient, API_ENDPOINTS } from '@/api/axios';
import { MentorAssignment, ApiResponse } from '@/types';

/**
 * Fetch assigned mentor for the authenticated student.
 */
export const getMyMentor = async (): Promise<ApiResponse<MentorAssignment | null>> => {
  const response = await apiClient.get<ApiResponse<MentorAssignment | null>>(
    API_ENDPOINTS.mentorship.myMentor
  );
  return response.data;
};

export default {
  getMyMentor,
};
