import { apiClient } from '@/api/axios';
import { ApiResponse } from '@/types';

export interface InstituteSettingsData {
  _id?: string;
  name: string;
  code: string;
  tagline?: string;
  description?: string;
  affiliation?: string;
  establishedYear?: number;
  principalName?: string;
  contactNumber?: string;
  email?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  academicSettings?: {
    currentAcademicYearId?: any;
    evaluationSystem?: 'TRIMESTER' | 'SEMESTER' | 'ANNUAL';
    attendanceMode?: 'DAILY' | 'SESSION_WISE' | 'SUBJECT_WISE';
  };
  branding?: {
    logoUrl?: string;
    faviconUrl?: string;
    themePrimaryColor?: string;
  };
  updatedAt?: string;
}

export const getInstituteSettings = async (): Promise<ApiResponse<InstituteSettingsData>> => {
  const response = await apiClient.get<ApiResponse<InstituteSettingsData>>('/admin/institute-settings');
  return response.data;
};

export const updateInstituteSettings = async (
  data: Partial<InstituteSettingsData>
): Promise<ApiResponse<InstituteSettingsData>> => {
  const response = await apiClient.put<ApiResponse<InstituteSettingsData>>('/admin/institute-settings', data);
  return response.data;
};

export default {
  getInstituteSettings,
  updateInstituteSettings,
};
