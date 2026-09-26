export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';

export interface AttendanceOverview {
  overallPercentage: number | null;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays?: number;
}

export interface AttendanceSessionRecord {
  id: string;
  date: string; // ISO date string e.g. "2026-09-23"
  day: string; // e.g. "Wednesday"
  session: string; // e.g. "Session 1 (08:30 - 09:15)"
  subject?: string;
  status: AttendanceStatus;
  time?: string; // e.g. "08:28 AM"
  device?: string; // e.g. "Terminal #1 - Gate Entry"
  remarks?: string;
}

export interface SubjectAttendance {
  subjectId?: string;
  subjectName: string;
  subjectCode?: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendancePercentage: number | null;
}

export interface MonthlyAttendanceHistory {
  month: string; // e.g. "2026-08" or "August 2026"
  academicYear?: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendancePercentage: number | null;
}

export interface AttendanceFilterParams {
  month?: string; // "YYYY-MM"
  academicYearId?: string;
  startDate?: string;
  endDate?: string;
}

export interface StudentMonthlyAttendanceResponse {
  overview: AttendanceOverview;
  records: AttendanceSessionRecord[];
  subjects: SubjectAttendance[];
}
