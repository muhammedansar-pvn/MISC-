import { apiClient, API_ENDPOINTS } from '@/api/axios';
import { ApiResponse } from '@/types';

export interface AdminAnalyticsData {
  kpis: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    totalFaculty: number;
    totalClasses: number;
    totalParents: number;
    averageStudentAttendance: number;
    upcomingExamsCount: number;
    pendingResultsCount: number;
    facultyStudentRatio: string;
  };
  students: {
    byClass: Array<{
      classId: string;
      className: string;
      classCode: string;
      department: string;
      total: number;
      active: number;
    }>;
    byAcademicYear: Array<{
      yearId: string;
      yearName: string;
      count: number;
    }>;
    byHouse: Array<{
      house: string;
      count: number;
    }>;
    byAdmissionYear: Array<{
      year: number;
      count: number;
    }>;
    statusOverview: {
      active: number;
      inactive: number;
      total: number;
    };
  };
  attendance: {
    overallPercentage: number;
    totalRecords: number;
    statusBreakdown: {
      present: number;
      late: number;
      absent: number;
      leave: number;
    };
    monthlyTrends: Array<{
      month: string;
      total: number;
      present: number;
      absent: number;
      late: number;
      percentage: number;
    }>;
    classWiseComparison: Array<{
      classId: string;
      className: string;
      classCode: string;
      total: number;
      attended: number;
      present: number;
      absent: number;
      late: number;
      percentage: number;
    }>;
    unmarkedClassesCount: number;
  };
  academics: {
    examsCount: number;
    totalResultsRecorded: number;
    passedCount: number;
    failedCount: number;
    passRate: number;
    averageScore: number;
    gradeDistribution: Array<{
      _id: string;
      count: number;
    }>;
    topPerformers: Array<{
      studentName: string;
      registrationNumber: string;
      className: string;
      percentage: number;
      grade: string;
      resultStatus: string;
    }>;
    strugglingStudents: Array<{
      studentId: string;
      studentName: string;
      registrationNumber: string;
      className: string;
      percentage: number;
      grade: string;
      resultStatus: string;
    }>;
    feeCollection: {
      collectedAmount: number;
      collectedCount: number;
      pendingAmount: number;
      pendingCount: number;
    };
  };
  faculty: {
    totalFaculty: number;
    facultyStudentRatio: string;
    markEntriesStatus: Array<{
      _id: string;
      count: number;
    }>;
  };
  requiresAttention: {
    lowAttendanceStudents: Array<{
      studentId: string;
      studentName: string;
      registrationNumber: string;
      className: string;
      total: number;
      attended: number;
      percentage: number;
    }>;
    failingStudents: Array<{
      studentId: string;
      studentName: string;
      registrationNumber: string;
      className: string;
      percentage: number;
      grade: string;
      resultStatus: string;
    }>;
    unmarkedClasses: Array<{
      classId: string;
      className: string;
      classCode: string;
      department: string;
    }>;
    pendingResultsExams: Array<{
      examId: string;
      title: string;
      code: string;
      endDate: string;
      status: string;
    }>;
  };
  availableFilters: {
    classes: Array<{ _id: string; name: string; code: string }>;
    academicYears: Array<{ _id: string; yearCode: string; name: string }>;
  };
}

export interface FacultyAnalyticsData {
  kpis: {
    assignedClassesCount: number;
    assignedSubjectsCount: number;
    totalAssignedStudents: number;
    myAverageAttendance: number;
    pendingMarksToSubmit: number;
  };
  classes: Array<{
    classId: string;
    className: string;
    classCode: string;
    department: string;
    studentCount: number;
    attendancePercentage: number;
    totalMarked: number;
  }>;
  attendanceTrend: Array<{
    month: string;
    percentage: number;
    total: number;
  }>;
  assignedSubjects: Array<{
    subjectId: string;
    name: string;
    code: string;
  }>;
  requiresAttention: {
    lowAttendanceStudents: Array<{
      studentId: string;
      name: string;
      registrationNumber: string;
      className: string;
      attendancePercentage: number;
      totalSessions: number;
      attendedSessions: number;
    }>;
    upcomingSchedules: any[];
  };
}

export interface StudentAnalyticsData {
  studentProfile: {
    studentId: string;
    name: string;
    registrationNumber: string;
    className: string;
    classCode: string;
    academicYear: string;
    house: string;
  };
  attendance: {
    percentage: number;
    status: string;
    isAtRisk: boolean;
    totalRecorded: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    leaveCount: number;
    bySubject: Array<{
      subjectId: string;
      subjectName: string;
      subjectCode: string;
      total: number;
      present: number;
      late: number;
      absent: number;
      percentage: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      total: number;
      percentage: number;
    }>;
  };
  academics: {
    cumulativePercentage: number;
    totalExamsTaken: number;
    passedSubjectsCount: number;
    failedSubjectsCount: number;
    examHistory: Array<{
      examId: string;
      examTitle: string;
      examCode: string;
      percentage: number;
      grade: string;
      resultStatus: string;
      totalMarksObtained: number;
      totalMaxMarks: number;
      subjects: any[];
    }>;
  };
  actionable: {
    upcomingExams: Array<{
      examId: string;
      title: string;
      code: string;
      startDate: string;
      endDate: string;
      fee: number;
      isRegistered: boolean;
      rollNumber: string | null;
      hallTicketStatus: string;
      paymentStatus: string;
    }>;
    pendingPayments: Array<{
      registrationId: string;
      examTitle: string;
      rollNumber: string;
      fee: number;
    }>;
  };
}

export interface ParentAnalyticsData {
  parentName: string;
  children: Array<{
    _id: string;
    nameEnglish: string;
    registrationNumber: string;
    className: string;
  }>;
  selectedChild: {
    _id: string;
    nameEnglish: string;
    registrationNumber: string;
    className: string;
    classCode: string;
    house: string;
    attendance: {
      percentage: number;
      isAtRisk: boolean;
      totalSessions: number;
      present: number;
      late: number;
      absent: number;
      leave: number;
      subjectBreakdown: Array<{
        subjectName: string;
        total: number;
        present: number;
        late: number;
        absent: number;
        percentage: number;
      }>;
    };
    academics: {
      examResults: Array<{
        examTitle: string;
        percentage: number;
        grade: string;
        resultStatus: string;
        subjectResults: any[];
      }>;
      examRegistrations: Array<{
        examTitle: string;
        rollNumber: string;
        hallTicketStatus: string;
        paymentStatus: string;
        fee: number;
      }>;
    };
    alerts: {
      lowAttendance: boolean;
      unpaidFees: boolean;
    };
  } | null;
  message?: string;
}

export interface ExportReportData {
  title: string;
  columns: Array<{ key: string; label: string }>;
  rows: any[];
}

export const getAdminAnalytics = async (params: {
  academicYearId?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<AdminAnalyticsData> => {
  const response = await apiClient.get<ApiResponse<AdminAnalyticsData>>(
    API_ENDPOINTS.analytics.admin,
    { params }
  );
  return (response.data as any).data || response.data;
};

export const getFacultyAnalytics = async (params: {
  academicYearId?: string;
  classId?: string;
} = {}): Promise<FacultyAnalyticsData> => {
  const response = await apiClient.get<ApiResponse<FacultyAnalyticsData>>(
    API_ENDPOINTS.analytics.faculty,
    { params }
  );
  return (response.data as any).data || response.data;
};

export const getStudentAnalytics = async (): Promise<StudentAnalyticsData> => {
  const response = await apiClient.get<ApiResponse<StudentAnalyticsData>>(
    API_ENDPOINTS.analytics.student
  );
  return (response.data as any).data || response.data;
};

export const getParentAnalytics = async (studentId?: string): Promise<ParentAnalyticsData> => {
  const response = await apiClient.get<ApiResponse<ParentAnalyticsData>>(
    API_ENDPOINTS.analytics.parent,
    { params: studentId ? { studentId } : undefined }
  );
  return (response.data as any).data || response.data;
};

export const getExportReport = async (
  reportType: string,
  params: { classId?: string; academicYearId?: string } = {}
): Promise<ExportReportData> => {
  const response = await apiClient.get<ApiResponse<ExportReportData>>(
    API_ENDPOINTS.analytics.export,
    { params: { type: reportType, ...params } }
  );
  return (response.data as any).data || response.data;
};
