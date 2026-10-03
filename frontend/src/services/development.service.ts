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

/**
 * Record or update a student's development score across the 5 domains (Faculty / Admin).
 */
export const recordDevelopmentScore = async (
  data: Partial<StudentDevelopmentScore> & { studentId: string; academicYearId: string; term: string }
): Promise<ApiResponse<StudentDevelopmentScore>> => {
  const response = await apiClient.post<ApiResponse<StudentDevelopmentScore>>(
    API_ENDPOINTS.development.recordScore,
    data
  );
  return response.data;
};

/**
 * Fetch development scores for a specific student (Faculty / Admin / Parent).
 */
export const getStudentDevelopmentScores = async (
  studentId: string
): Promise<ApiResponse<StudentDevelopmentScore[]>> => {
  const response = await apiClient.get<ApiResponse<StudentDevelopmentScore[]>>(
    API_ENDPOINTS.development.studentScores(studentId)
  );
  return response.data;
};

export default {
  getMyDevelopmentScores,
  recordDevelopmentScore,
  getStudentDevelopmentScores,
};
