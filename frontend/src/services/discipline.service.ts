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

/**
 * Record a new disciplinary incident (Faculty / Admin).
 */
export const recordDisciplineIncident = async (data: {
  studentId: string;
  incidentType: string;
  severity?: string;
  demeritPoints?: number;
  description?: string;
  actionTaken?: string;
  incidentDate?: string;
}): Promise<ApiResponse<DisciplineRecord>> => {
  const response = await apiClient.post<ApiResponse<DisciplineRecord>>(
    API_ENDPOINTS.discipline.recordIncident,
    data
  );
  return response.data;
};

/**
 * Resolve an existing disciplinary incident (Faculty / Admin).
 */
export const resolveDisciplineIncident = async (
  id: string,
  data: { resolutionRemarks?: string }
): Promise<ApiResponse<DisciplineRecord>> => {
  const response = await apiClient.patch<ApiResponse<DisciplineRecord>>(
    API_ENDPOINTS.discipline.resolveIncident(id),
    data
  );
  return response.data;
};

/**
 * Fetch disciplinary records for an authorized student.
 */
export const getStudentDisciplineRecords = async (
  studentId: string
): Promise<ApiResponse<DisciplineRecord[]>> => {
  const response = await apiClient.get<ApiResponse<DisciplineRecord[]>>(
    API_ENDPOINTS.discipline.studentRecords(studentId)
  );
  return response.data;
};

export default {
  getMyDisciplineRecords,
  recordDisciplineIncident,
  resolveDisciplineIncident,
  getStudentDisciplineRecords,
};
