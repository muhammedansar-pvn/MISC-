import { apiClient, API_ENDPOINTS } from '@/api/axios';
import { ApiResponse } from '@/types';

export interface StudyMaterialItem {
  _id: string;
  title: string;
  chapter?: string;
  classId: {
    _id: string;
    name: string;
    code: string;
  };
  subjectId: {
    _id: string;
    name: string;
    code: string;
  };
  facultyId?: {
    _id: string;
    nameEnglish?: string;
  };
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  originalFileName?: string;
  createdAt: string;
}

export const getStudyMaterials = async (params: {
  classId?: string;
  subjectId?: string;
  facultyId?: string;
  chapter?: string;
} = {}): Promise<ApiResponse<StudyMaterialItem[]>> => {
  const response = await apiClient.get<ApiResponse<StudyMaterialItem[]>>(
    API_ENDPOINTS.studyMaterials.list,
    { params }
  );
  return response.data;
};

export const getStudyMaterialById = async (id: string): Promise<ApiResponse<StudyMaterialItem>> => {
  const response = await apiClient.get<ApiResponse<StudyMaterialItem>>(
    API_ENDPOINTS.studyMaterials.byId(id)
  );
  return response.data;
};

export const createStudyMaterial = async (formData: FormData): Promise<ApiResponse<StudyMaterialItem>> => {
  const response = await apiClient.post<ApiResponse<StudyMaterialItem>>(
    API_ENDPOINTS.studyMaterials.list,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};

export const deleteStudyMaterial = async (id: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.delete<ApiResponse<any>>(
    API_ENDPOINTS.studyMaterials.byId(id)
  );
  return response.data;
};

export default {
  getStudyMaterials,
  getStudyMaterialById,
  createStudyMaterial,
  deleteStudyMaterial,
};
