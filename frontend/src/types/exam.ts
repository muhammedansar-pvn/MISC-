import { AcademicYear, ClassModel, Subject } from './academic';
import { StudentProfile } from './student';

export interface Exam {
  _id: string;
  name?: string;
  title?: string;
  code?: string;
  examName?: string;
  examCode?: string;
  term?: string;
  examType?: string;
  academicYearId?: string | AcademicYear;
  startDate?: string;
  endDate?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamPayload {
  name?: string;
  title?: string;
  code?: string;
  examName?: string;
  examCode?: string;
  term?: string;
  examType?: string;
  academicYearId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  [key: string]: any;
}

export interface ExamSchedule {
  _id: string;
  examId?: string | Exam;
  classId?: string | ClassModel;
  subjectId?: string | Subject;
  examDate: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  passingMarks?: number;
  passMarks?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamSchedulePayload {
  examId: string;
  classId?: string;
  subjectId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  passingMarks?: number;
  passMarks?: number;
  status?: string;
  [key: string]: any;
}

export interface ExamRegistration {
  _id: string;
  studentId?: string | StudentProfile | any;
  examId?: string | Exam | any;
  institutionId?: any;
  rollNumber?: string;
  registrationNumber?: string;
  registrationStatus?: string;
  paymentId?: any;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface ExamRegistrationPayload {
  studentId: string;
  examId: string;
  registrationStatus?: string;
  status?: string;
  [key: string]: any;
}

export interface MarkEntry {
  _id: string;
  examId?: string | Exam | any;
  examScheduleId?: string | ExamSchedule | any;
  studentId?: string | StudentProfile | any;
  subjectId?: string | any;
  evaluatorId?: string | any;
  marksObtained: number;
  isAbsent?: boolean;
  isVerified?: boolean;
  status?: string;
  verifiedBy?: any;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}


export interface MarkEntryPayload {
  examScheduleId: string;
  studentId: string;
  marksObtained: number;
  [key: string]: any;
}

export interface ExamResult {
  _id: string;
  studentId?: string | StudentProfile | any;
  examId?: string | Exam | any;
  totalMarks?: number;
  totalMarksObtained?: number;
  totalMaxMarks?: number;
  percentage: number;
  grade: string;
  sgpa?: number | string;
  resultStatus?: 'PASSED' | 'FAILED' | 'WITHHELD' | 'PASS' | 'FAIL' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateExamResultsPayload {
  examId: string;
  classId?: string;
  [key: string]: any;
}
