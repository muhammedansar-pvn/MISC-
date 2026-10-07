import { apiClient, API_ENDPOINTS } from '@/api/axios';
import { ApiResponse, Syllabus } from '@/types';

export interface ParentStudent {
  _id: string;
  nameEnglish: string;
  nameArabic?: string;
  registrationNumber: string;
  admissionYear?: number;
  dateOfBirth?: string;
  photo?: string;
  status: string;
  classId?: {
    _id: string;
    name: string;
    code?: string;
  };
  institutionId?: {
    _id: string;
    name: string;
    code?: string;
  };
}

export interface ParentProfileData {
  _id: string;
  userId: string;
  name: string;
  relationType: string;
  contactNumber?: string;
  whatsappNumber?: string;
  address?: string;
  studentIds: ParentStudent[];
  status: string;
}

export const getParentProfile = async (): Promise<ApiResponse<{ parent: ParentProfileData }>> => {
  const response = await apiClient.get<ApiResponse<{ parent: ParentProfileData }>>(API_ENDPOINTS.parents.me);
  return response.data;
};

export const getParentStudents = async (): Promise<ApiResponse<{ students: ParentStudent[] }>> => {
  const response = await apiClient.get<ApiResponse<{ students: ParentStudent[] }>>(API_ENDPOINTS.parents.students);
  return response.data;
};

export const getLinkedStudentById = async (studentId: string): Promise<ApiResponse<{ student: ParentStudent }>> => {
  const response = await apiClient.get<ApiResponse<{ student: ParentStudent }>>(API_ENDPOINTS.parents.studentById(studentId));
  return response.data;
};

export const getLinkedStudentSyllabus = async (
  studentId: string,
  params?: { subjectId?: string; academicYearId?: string; examType?: string }
): Promise<ApiResponse<{ student: ParentStudent; syllabuses: Syllabus[]; data: Syllabus[] }>> => {
  const response = await apiClient.get<ApiResponse<{ student: ParentStudent; syllabuses: Syllabus[]; data: Syllabus[] }>>(
    API_ENDPOINTS.parents.studentSyllabus(studentId),
    { params }
  );
  return response.data;
};

export default {
  getParentProfile,
  getParentStudents,
  getLinkedStudentById,
  getLinkedStudentSyllabus,
};
