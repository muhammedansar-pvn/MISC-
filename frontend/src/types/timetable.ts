import { AcademicYear, ClassModel, Subject } from './academic';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface TimetableFaculty {
  _id: string;
  fullName?: string;
  name?: string;
  nameEnglish?: string;
  nameArabic?: string;
  designation?: string;
  contactNumber?: string;
}

export interface TimetableEntry {
  _id: string;
  academicYearId?: string | AcademicYear;
  classId?: string | ClassModel;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectId: string | Subject;
  facultyId: string | TimetableFaculty;
  room?: string;
  status: 'ACTIVE' | 'INACTIVE';
  institutionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimetablePayload {
  academicYearId: string;
  classId: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  facultyId: string;
  room?: string;
  institutionId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface StudentTimetableData {
  class: ClassModel | null;
  academicYear: AcademicYear | null;
  entries: TimetableEntry[];
}
