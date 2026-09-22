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
  academicYearId?: string | AcademicYear;
  institutionId?: string | any;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassPayload {
  name: string;
  code: string;
  academicYearId?: string;
  status?: string;
}

export type SubjectType = 'THEORY' | 'PRACTICAL' | 'BOTH';

export interface Subject {
  _id: string;
  name: string;
  code: string;
  type: SubjectType;
  credits: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectPayload {
  name: string;
  code: string;
  type: SubjectType;
  credits: number;
  status?: string;
}

export interface Syllabus {
  _id: string;
  title: string;
  academicYearId?: string | AcademicYear;
  classId?: string | ClassModel;
  subjectId?: string | Subject;
  fileUrl?: string;
  version?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}


export interface SyllabusPayload {
  title: string;
  academicYearId?: string;
  classId?: string;
  subjectId?: string;
  fileUrl?: string;
  status?: string;
}
