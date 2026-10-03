import { AuthUser } from './auth';
import { Institution } from './institution';

export interface FacultyProfile {
  _id: string;
  userId?: string | AuthUser;
  facultyId?: string;
  nameEnglish?: string;
  nameArabic?: string;
  placeEnglish?: string;
  designation?: string;
  islamicQualification?: string;
  academicQualification?: string;
  joiningYear?: number;
  previousExperience?: string;
  contactNumber?: string;
  institutionId?: string | Institution;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  currentAssignments?: FacultyCurrentAssignment[];
  academicActivity?: FacultyAcademicActivity;
  [key: string]: any;
}

export interface FacultyCurrentAssignment {
  _id: string;
  classId?: { _id: string; name?: string; code?: string; department?: string };
  subjectId?: { _id: string; name?: string; subjectName?: string; code?: string; subjectCode?: string; category?: string };
  academicYearId?: { _id: string; yearName?: string; yearCode?: string };
}

export interface FacultyAcademicActivity {
  assignedClassesCount: number;
  assignedSubjectsCount: number;
  activeAssignmentsCount: number;
  timetableEntriesCount: number;
  assignmentsCreatedCount: number;
  attendanceRecordsCount: number;
  marksEvaluatedCount: number;
  menteesCount: number;
}

export interface FacultyPayload {
  userId: string;
  facultyId: string;
  nameEnglish?: string;
  nameArabic?: string;
  placeEnglish?: string;
  designation?: string;
  islamicQualification?: string;
  academicQualification?: string;
  joiningYear?: number;
  previousExperience?: string;
  contactNumber?: string;
  institutionId?: string;
  [key: string]: any;
}

export interface FacultyDashboardStats {
  assignedClassesCount: number;
  assignedSubjectsCount: number;
  totalStudentsCount: number;
  todayClassesCount: number;
  todayTimetable: any[];
  unmarkedAttendanceCount: number;
  pendingAssignmentsCount: number;
  pendingLeavesCount: number;
  todayDayOfWeek: string;
}

export interface FacultyTimetableEntry {
  _id: string;
  facultyId: string;
  classId: {
    _id: string;
    name: string;
    code: string;
    department?: string;
  };
  subjectId: {
    _id: string;
    name: string;
    subjectName?: string;
    code: string;
    subjectCode?: string;
    category?: string;
    type?: string;
  };
  academicYearId?: {
    _id: string;
    yearName: string;
    yearCode: string;
  };
  dayOfWeek: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
}

export interface FacultyRemark {
  _id: string;
  studentId: string;
  classId: string;
  subjectId?: {
    _id: string;
    name?: string;
    subjectName?: string;
    code?: string;
    subjectCode?: string;
  };
  facultyId?: {
    _id: string;
    nameEnglish?: string;
    designation?: string;
  };
  category: 'ACADEMIC' | 'DISCIPLINE' | 'BEHAVIORAL' | 'ATTENDANCE' | 'GENERAL';
  remark: string;
  authorName: string;
  createdAt: string;
}

export interface FacultyStudent360Data {
  student: any;
  attendanceOverview: any;
  recentAttendance: any[];
  remarks: FacultyRemark[];
  teachers: any[];
  recentAssignments: any[];
}
