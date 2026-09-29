export interface MentorUser {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
}

export interface MentorFacultyProfile {
  _id: string;
  facultyId: string;
  department?: string;
  userId?: MentorUser;
}

export interface MentorAcademicYear {
  _id: string;
  yearName: string;
  yearCode: string;
}

export interface MentorAssignment {
  _id: string;
  mentorId: MentorFacultyProfile;
  studentId: string;
  academicYearId: MentorAcademicYear;
  // NOTE: monitoringCategory & notes are internal faculty fields returned by the API
  // but MUST BE EXCLUDED from any student-facing UI rendering.
  monitoringCategory?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
