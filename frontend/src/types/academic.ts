export interface AcademicYear {
  _id: string;
  yearName: string;
  yearCode: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicYearPayload {
  yearName: string;
  yearCode: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  status?: string;
}

export type ClassLevel = ClassModel;

export interface ClassModel {
  _id: string;
  name: string;
  className?: string;
  code: string;
  department?: string;
  academicYearId?: string | AcademicYear;
  institutionId?: string | any;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassPayload {
  name: string;
  code: string;
  department?: string;
  academicYearId?: string;
  status?: string;
}

export type SubjectType = 'THEORY' | 'PRACTICAL' | 'BOTH';

export interface Subject {
  _id: string;
  name: string;
  arabicName?: string;
  code: string;
  category?: string;
  description?: string;
  type: SubjectType;
  credits: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectPayload {
  name: string;
  code: string;
  category?: string;
  description?: string;
  type: SubjectType;
  credits: number;
  status?: string;
}

export type SyllabusExamType = 'HALF_YEARLY' | 'ANNUAL';

export interface SyllabusTopic {
  title: string;
  isCompleted?: boolean;
  completedAt?: string;
  [key: string]: any;
}

export interface SyllabusUnit {
  unitNumber?: number;
  title: string;
  unitTitle?: string;
  topics?: string | string[] | SyllabusTopic[] | any;
  isCompleted?: boolean;
  plannedHours?: number;
  completedHours?: number;
  completedAt?: string;
  [key: string]: any;
}

export interface Syllabus {
  _id: string;
  title?: string;
  kitabName: string;
  examType: SyllabusExamType;
  units: SyllabusUnit[];
  completionPercentage?: number;
  academicYearId?: string | AcademicYear;
  classId?: string | ClassModel;
  subjectId?: string | Subject;
  fileUrl?: string;
  fileName?: string;
  version?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface SyllabusPayload {
  kitabName: string;
  title?: string;
  examType: SyllabusExamType;
  units?: SyllabusUnit[];
  completionPercentage?: number;
  academicYearId?: string;
  classId?: string;
  subjectId?: string;
  fileUrl?: string;
  fileName?: string;
  version?: string;
  status?: string;
}

export interface FacultyAssignment {
  _id: string;
  facultyId: {
    _id: string;
    facultyId?: string;
    nameEnglish?: string;
    nameArabic?: string;
    designation?: string;
    contactNumber?: string;
    photo?: string;
    department?: string;
  } | any;
  academicYearId: {
    _id: string;
    yearName?: string;
    yearCode?: string;
    isCurrent?: boolean;
    status?: string;
  } | any;
  classId: {
    _id: string;
    name?: string;
    code?: string;
    department?: string;
    status?: string;
  } | any;
  subjectId: {
    _id: string;
    name?: string;
    subjectName?: string;
    code?: string;
    subjectCode?: string;
    category?: string;
    type?: string;
    credits?: number;
  } | any;
  status: 'ACTIVE' | 'INACTIVE';
  isPrimary?: boolean;
  notes?: string;
  assignedBy?: {
    _id: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface FacultyAssignmentPayload {
  facultyId: string;
  academicYearId: string;
  classId: string;
  subjectId: string;
  isPrimary?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  notes?: string;
}

export interface FacultyClassView {
  _id: string;
  classId: string;
  name: string;
  code: string;
  department?: string;
  academicYear?: any;
  studentCount: number;
  subjects: Array<{
    _id: string;
    name: string;
    code: string;
    category?: string;
    credits?: number;
    assignmentId?: string;
  }>;
}
