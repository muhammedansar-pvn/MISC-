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
  mentorId: MentorFacultyProfile | any;
  studentId: string | any;
  academicYearId: MentorAcademicYear | any;
  monitoringCategory?: string;
  notes?: string;
  notesHistory?: Array<{
    note: string;
    category?: string;
    createdAt?: string;
    createdBy?: any;
  }>;
  createdAt: string;
  updatedAt: string;
}
