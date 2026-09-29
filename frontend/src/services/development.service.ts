import { apiClient, API_ENDPOINTS } from '@/api/axios';
import { StudentDevelopmentScore, ApiResponse } from '@/types';

/**
 * Fetch development and progress scores across the 5 domains for the authenticated student.
 */
export const getMyDevelopmentScores = async (): Promise<ApiResponse<StudentDevelopmentScore[]>> => {
  const response = await apiClient.get<ApiResponse<StudentDevelopmentScore[]>>(
    API_ENDPOINTS.development.myScores
  );
  return response.data;
};

export default {
  getMyDevelopmentScores,
};
