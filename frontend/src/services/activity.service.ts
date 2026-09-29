import { apiClient, API_ENDPOINTS } from '@/api/axios';
import { StudentAchievement, ApiResponse } from '@/types';

/**
 * Fetch activities and achievements for the authenticated student.
 */
export const getMyAchievements = async (): Promise<ApiResponse<StudentAchievement[]>> => {
  const response = await apiClient.get<ApiResponse<StudentAchievement[]>>(
    API_ENDPOINTS.activities.myAchievements
  );
  return response.data;
};

export default {
  getMyAchievements,
};
