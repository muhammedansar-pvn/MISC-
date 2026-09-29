import apiClient, { API_ENDPOINTS } from '@/api/axios';
import { ApiResponse, TimetableEntry, TimetablePayload, StudentTimetableData } from '@/types';

export const getMyTimetable = async (): Promise<ApiResponse<StudentTimetableData>> => {
  const response = await apiClient.get<ApiResponse<StudentTimetableData>>(
    API_ENDPOINTS.students.timetable
  );
  return response.data;
};

export const getTimetables = async (params: {
  classId?: string;
  academicYearId?: string;
  dayOfWeek?: string;
  status?: string;
} = {}): Promise<ApiResponse<TimetableEntry[]>> => {
  const response = await apiClient.get<ApiResponse<TimetableEntry[]>>(
    API_ENDPOINTS.academic.timetables,
    { params }
  );
  return response.data;
};

export const getTimetableById = async (id: string): Promise<ApiResponse<TimetableEntry>> => {
  const response = await apiClient.get<ApiResponse<TimetableEntry>>(
    API_ENDPOINTS.academic.timetableById(id)
  );
  return response.data;
};

export const createTimetableEntry = async (
  data: TimetablePayload
): Promise<ApiResponse<TimetableEntry>> => {
  const response = await apiClient.post<ApiResponse<TimetableEntry>>(
    API_ENDPOINTS.academic.timetables,
    data
  );
  return response.data;
};

export const updateTimetableEntry = async (
  id: string,
  data: Partial<TimetablePayload>
): Promise<ApiResponse<TimetableEntry>> => {
  const response = await apiClient.put<ApiResponse<TimetableEntry>>(
    API_ENDPOINTS.academic.timetableById(id),
    data
  );
  return response.data;
};

export const deleteTimetableEntry = async (id: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(
    API_ENDPOINTS.academic.timetableById(id)
  );
  return response.data;
};

export default {
  getMyTimetable,
  getTimetables,
  getTimetableById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
};
