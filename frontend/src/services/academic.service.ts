import { apiClient, API_ENDPOINTS } from '@/lib/api';
import {
  AcademicYear,
  AcademicYearPayload,
  ClassModel,
  ClassPayload,
  Subject,
  SubjectPayload,
  Syllabus,
  SyllabusPayload,
  ApiResponse,
  PaginationParams,
} from '@/types';

// --- ACADEMIC YEARS ---
export const getAcademicYears = async (): Promise<ApiResponse<AcademicYear[]>> => {
  const response = await apiClient.get<ApiResponse<AcademicYear[]>>(API_ENDPOINTS.academic.academicYears);
  return response.data;
};

export const getAcademicYearById = async (id: string): Promise<ApiResponse<AcademicYear>> => {
  const response = await apiClient.get<ApiResponse<AcademicYear>>(API_ENDPOINTS.academic.academicYearById(id));
  return response.data;
};

export const createAcademicYear = async (data: AcademicYearPayload): Promise<ApiResponse<AcademicYear>> => {
  const response = await apiClient.post<ApiResponse<AcademicYear>>(API_ENDPOINTS.academic.academicYears, data);
  return response.data;
};

export const updateAcademicYear = async (
  id: string,
  data: Partial<AcademicYearPayload>
): Promise<ApiResponse<AcademicYear>> => {
  const response = await apiClient.put<ApiResponse<AcademicYear>>(API_ENDPOINTS.academic.academicYearById(id), data);
  return response.data;
};

// --- CLASSES ---
export const getClasses = async (params: PaginationParams = {}): Promise<ApiResponse<ClassModel[]>> => {
  const response = await apiClient.get<ApiResponse<ClassModel[]>>(API_ENDPOINTS.academic.classes, { params });
  return response.data;
};

export const getClassById = async (id: string): Promise<ApiResponse<ClassModel>> => {
  const response = await apiClient.get<ApiResponse<ClassModel>>(API_ENDPOINTS.academic.classById(id));
  return response.data;
};

export const createClass = async (data: ClassPayload): Promise<ApiResponse<ClassModel>> => {
  const response = await apiClient.post<ApiResponse<ClassModel>>(API_ENDPOINTS.academic.classes, data);
  return response.data;
};

export const updateClass = async (
  id: string,
  data: Partial<ClassPayload>
): Promise<ApiResponse<ClassModel>> => {
  const response = await apiClient.put<ApiResponse<ClassModel>>(API_ENDPOINTS.academic.classById(id), data);
  return response.data;
};

// --- SUBJECTS ---
export const getSubjects = async (params: PaginationParams = {}): Promise<ApiResponse<Subject[]>> => {
  const response = await apiClient.get<ApiResponse<Subject[]>>(API_ENDPOINTS.academic.subjects, { params });
  return response.data;
};

export const getSubjectById = async (id: string): Promise<ApiResponse<Subject>> => {
  const response = await apiClient.get<ApiResponse<Subject>>(API_ENDPOINTS.academic.subjectById(id));
  return response.data;
};

export const createSubject = async (data: SubjectPayload): Promise<ApiResponse<Subject>> => {
  const response = await apiClient.post<ApiResponse<Subject>>(API_ENDPOINTS.academic.subjects, data);
  return response.data;
};

export const updateSubject = async (
  id: string,
  data: Partial<SubjectPayload>
): Promise<ApiResponse<Subject>> => {
  const response = await apiClient.put<ApiResponse<Subject>>(API_ENDPOINTS.academic.subjectById(id), data);
  return response.data;
};

// --- SYLLABUSES ---
export const getSyllabuses = async (params: PaginationParams = {}): Promise<ApiResponse<Syllabus[]>> => {
  const response = await apiClient.get<ApiResponse<Syllabus[]>>(API_ENDPOINTS.academic.syllabuses, { params });
  return response.data;
};

export const getSyllabusById = async (id: string): Promise<ApiResponse<Syllabus>> => {
  const response = await apiClient.get<ApiResponse<Syllabus>>(API_ENDPOINTS.academic.syllabusById(id));
  return response.data;
};

export const createSyllabus = async (data: SyllabusPayload): Promise<ApiResponse<Syllabus>> => {
  const response = await apiClient.post<ApiResponse<Syllabus>>(API_ENDPOINTS.academic.syllabuses, data);
  return response.data;
};

export const updateSyllabus = async (
  id: string,
  data: Partial<SyllabusPayload>
): Promise<ApiResponse<Syllabus>> => {
  const response = await apiClient.put<ApiResponse<Syllabus>>(API_ENDPOINTS.academic.syllabusById(id), data);
  return response.data;
};

export default {
  getAcademicYears,
  getAcademicYearById,
  createAcademicYear,
  updateAcademicYear,
  getClasses,
  getClassById,
  createClass,
  updateClass,
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  getSyllabuses,
  getSyllabusById,
  createSyllabus,
  updateSyllabus,
};
