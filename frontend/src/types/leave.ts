export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type LeaveType = 'CASUAL' | 'MEDICAL' | 'DUTY' | 'FAMILY_EMERGENCY' | 'OTHER';

export interface LeaveDateRange {
  startDate: string;
  endDate: string;
}

export interface LeaveStudentInfo {
  _id: string;
  nameEnglish?: string;
  registrationNumber?: string;
  classId?: string | { _id: string; name: string };
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
  applicantRole?: 'STUDENT' | 'PARENT';
  leaveType?: LeaveType;
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
  classId?: string;
  page?: number;
  limit?: number;
}

export interface ApplyLeavePayload {
  studentId?: string;
  startDate?: string;
  endDate?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  reason: string;
  leaveType?: LeaveType;
}
