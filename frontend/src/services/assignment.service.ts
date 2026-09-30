import { apiClient, API_ENDPOINTS } from '@/api/axios';
import { ApiResponse } from '@/types';

export interface AssignmentItem {
  _id: string;
  title: string;
  description?: string;
  classId: {
    _id: string;
    name: string;
    code: string;
  };
  subjectId: {
    _id: string;
    name?: string;
    subjectName?: string;
    code?: string;
    subjectCode?: string;
  };
  facultyId?: {
    _id: string;
    nameEnglish?: string;
    facultyId?: string;
  };
  academicYearId?: {
    _id: string;
    yearName?: string;
    yearCode?: string;
    status?: string;
  };
  maxMarks?: number;
  dueDate: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }>;
  createdAt: string;
  submissionCount?: number;
  mySubmission?: AssignmentSubmissionItem | null;
}

export interface AssignmentSubmissionItem {
  _id: string;
  assignmentId: string | any;
  studentId: {
    _id: string;
    nameEnglish: string;
    registrationNumber: string;
    photo?: string;
  };
  submittedFile?: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  };
  link?: string;
  submittedAt: string;
  status: 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED';
  marks?: number;
  feedback?: string;
  gradedBy?: {
    _id: string;
    nameEnglish?: string;
    facultyId?: string;
  };
  gradedAt?: string;
}

export const getAssignments = async (params: {
  classId?: string;
  subjectId?: string;
  facultyId?: string;
  academicYearId?: string;
} = {}): Promise<ApiResponse<AssignmentItem[]>> => {
  const response = await apiClient.get<ApiResponse<AssignmentItem[]>>(
    API_ENDPOINTS.assignments.list,
    { params }
  );
  return response.data;
};

export const getAssignmentById = async (id: string): Promise<ApiResponse<AssignmentItem>> => {
  const response = await apiClient.get<ApiResponse<AssignmentItem>>(
    API_ENDPOINTS.assignments.byId(id)
  );
  return response.data;
};

export const createAssignment = async (formData: FormData): Promise<ApiResponse<AssignmentItem>> => {
  const response = await apiClient.post<ApiResponse<AssignmentItem>>(
    API_ENDPOINTS.assignments.list,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};

export const updateAssignment = async (id: string, payload: any): Promise<ApiResponse<AssignmentItem>> => {
  const response = await apiClient.put<ApiResponse<AssignmentItem>>(
    API_ENDPOINTS.assignments.byId(id),
    payload
  );
  return response.data;
};

export const deleteAssignment = async (id: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.delete<ApiResponse<any>>(
    API_ENDPOINTS.assignments.byId(id)
  );
  return response.data;
};

export const getAssignmentSubmissions = async (id: string): Promise<ApiResponse<AssignmentSubmissionItem[]>> => {
  const response = await apiClient.get<ApiResponse<AssignmentSubmissionItem[]>>(
    API_ENDPOINTS.assignments.submissions(id)
  );
  return response.data;
};

export const getMySubmission = async (id: string): Promise<ApiResponse<AssignmentSubmissionItem>> => {
  const response = await apiClient.get<ApiResponse<AssignmentSubmissionItem>>(
    API_ENDPOINTS.assignments.mySubmission(id)
  );
  return response.data;
};

export const submitAssignment = async (id: string, formData: FormData): Promise<ApiResponse<AssignmentSubmissionItem>> => {
  const response = await apiClient.post<ApiResponse<AssignmentSubmissionItem>>(
    API_ENDPOINTS.assignments.submit(id),
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};

export const gradeSubmission = async (
  assignmentId: string,
  submissionId: string,
  payload: { marks: number; feedback?: string }
): Promise<ApiResponse<AssignmentSubmissionItem>> => {
  const response = await apiClient.post<ApiResponse<AssignmentSubmissionItem>>(
    API_ENDPOINTS.assignments.grade(assignmentId, submissionId),
    payload
  );
  return response.data;
};

export default {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  getMySubmission,
  submitAssignment,
  gradeSubmission,
};
