import { apiClient, API_ENDPOINTS } from '@/api/axios';
import { DisciplineRecord, ApiResponse } from '@/types';

/**
 * Fetch conduct & disciplinary records for the authenticated student.
 */
export const getMyDisciplineRecords = async (): Promise<ApiResponse<DisciplineRecord[]>> => {
  const response = await apiClient.get<ApiResponse<DisciplineRecord[]>>(
    API_ENDPOINTS.discipline.myRecords
  );
  return response.data;
};

export default {
  getMyDisciplineRecords,
};
