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

/**
 * Fetch assigned mentees for the authenticated faculty member.
 */
export const getMyMentees = async (): Promise<ApiResponse<MentorAssignment[]>> => {
  const response = await apiClient.get<ApiResponse<MentorAssignment[]>>(
    API_ENDPOINTS.mentorship.myMentees
  );
  return response.data;
};

/**
 * Update monitoring status and category for a mentee assignment.
 */
export const updateMenteeMonitoring = async (
  id: string,
  data: { monitoringCategory?: string; notes?: string }
): Promise<ApiResponse<MentorAssignment>> => {
  const response = await apiClient.patch<ApiResponse<MentorAssignment>>(
    API_ENDPOINTS.mentorship.updateMonitoring(id),
    data
  );
  return response.data;
};

/**
 * Add a mentorship progress note for an assigned student.
 */
export const addMentorshipNote = async (
  studentId: string,
  data: { note: string; category?: string }
): Promise<ApiResponse<MentorAssignment>> => {
  const response = await apiClient.post<ApiResponse<MentorAssignment>>(
    API_ENDPOINTS.mentorship.addNote(studentId),
    data
  );
  return response.data;
};

export default {
  getMyMentor,
  getMyMentees,
  updateMenteeMonitoring,
  addMentorshipNote,
};
