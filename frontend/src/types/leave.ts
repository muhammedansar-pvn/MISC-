export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveDateRange {
  startDate: string;
  endDate: string;
}

export interface LeaveStudentInfo {
  _id: string;
  nameEnglish?: string;
  registrationNumber?: string;
  classId?: string;
}

export interface LeaveApplicantInfo {
  _id: string;
  name?: string;
  email?: string;
  mobile?: string;
}

export interface LeaveApproverInfo {
  _id: string;
  nameEnglish?: string;
  facultyId?: string;
}

export interface LeaveApplication {
  _id: string;
  studentId: LeaveStudentInfo | string;
  appliedBy: LeaveApplicantInfo | string;
  approvedBy?: LeaveApproverInfo | string | null;
  dateRange: LeaveDateRange;
  reason: string;
  status: LeaveStatus;
  reviewedAt?: string;
  reviewRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveFilterParams {
  status?: LeaveStatus | string;
  studentId?: string;
}
