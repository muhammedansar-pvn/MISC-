import axios from 'axios';
import { getToken, clearAuthStorage } from '../utils/token';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token if present in browser localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized 401 Session Handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401 && typeof window !== 'undefined') {
      try {
        if (getToken()) {
          clearAuthStorage();
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      } catch {
        // Ignore storage access errors
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Centralized API Endpoints Map
 * All paths align directly with the Express API router mounts.
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verifyEmailOtp: '/auth/verify-email-otp',
    resendEmailOtp: '/auth/resend-email-otp',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
    setPassword: '/auth/set-password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    accountSetup: '/auth/account-setup',
    accountSetupToken: (token) => `/auth/account-setup/${token}`,
    resendSetupLink: '/auth/resend-setup-link',
    sendOtp: '/auth/send-otp',
  },

  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    userById: (id) => `/admin/users/${id}`,
    verifyOtp: '/admin/users/verify-otp',
    resendOtp: '/admin/users/resend-otp',
    userStatus: (id) => `/admin/users/${id}/status`,
    resetPassword: (id) => `/admin/users/${id}/reset-password`,
    registerStudent: '/admin/students/register',
    bulkAssignStudents: '/admin/students/bulk-assign',
  },


  // NOTE: Express backend mounts at /academic/* (singular). Corrected from legacy /academics/*
  academic: {
    academicYears: '/academic/academic-years',
    academicYearById: (id) => `/academic/academic-years/${id}`,
    classes: '/academic/classes',
    classById: (id) => `/academic/classes/${id}`,
    subjects: '/academic/subjects',
    subjectById: (id) => `/academic/subjects/${id}`,
    syllabuses: '/academic/syllabuses',
    syllabusById: (id) => `/academic/syllabuses/${id}`,
    timetables: '/academic/timetables',
    timetableById: (id) => `/academic/timetables/${id}`,
    facultyAssignments: '/academic/faculty-assignments',
    facultyAssignmentById: (id) => `/academic/faculty-assignments/${id}`,
  },

  institutions: {
    list: '/institutions',
    byId: (id) => `/institutions/${id}`,
  },

  students: {
    list: '/students',
    byId: (id) => `/students/${id}`,
    status: (id) => `/students/${id}/status`,
    profile: '/students/profile',
    timetable: '/students/timetable',
    teachers: '/students/teachers',
  },

  faculty: {
    list: '/faculty',
    byId: (id) => `/faculty/${id}`,
    status: (id) => `/faculty/${id}/status`,
    dashboardStats: '/faculty/dashboard-stats',
    myAssignments: '/faculty/my-assignments',
    myClasses: '/faculty/my-classes',
    myTimetable: '/faculty/my-timetable',
    myStudents: '/faculty/my-students',
    student360: (id) => `/faculty/students/${id}/360`,
    studentRemarks: (id) => `/faculty/students/${id}/remarks`,
  },

  assignments: {
    list: '/assignments',
    byId: (id) => `/assignments/${id}`,
    submissions: (id) => `/assignments/${id}/submissions`,
    mySubmission: (id) => `/assignments/${id}/my-submission`,
    submit: (id) => `/assignments/${id}/submit`,
    grade: (id, submissionId) => `/assignments/${id}/submissions/${submissionId}/grade`,
  },

  studyMaterials: {
    list: '/study-materials',
    byId: (id) => `/study-materials/${id}`,
  },

  cms: {
    articles: '/cms/articles',
    articleBySlug: (slug) => `/cms/articles/${slug}`,
    articleById: (id) => `/cms/articles/${id}`,
    resources: '/cms/resources',
    resourceById: (id) => `/cms/resources/${id}`,
    enquiries: '/cms/enquiries',
    enquiryStatus: (id) => `/cms/enquiries/${id}/status`,
  },

  events: {
    list: '/events/events',
    bySlug: (slug) => `/events/events/${slug}`,
    byId: (id) => `/events/events/${id}`,
    registrations: '/events/event-registrations',
  },

  payments: {
    list: '/payments',
    byTransactionId: (txId) => `/payments/${txId}`,
    verify: '/payments/verify',
  },

  exams: {
    list: '/exams/exams',
    byId: (id) => `/exams/exams/${id}`,
    schedules: '/exams/exam-schedules',
    scheduleById: (id) => `/exams/exam-schedules/${id}`,
    facultySchedules: '/exams/faculty/schedules',
    scheduleRoster: (id) => `/exams/exam-schedules/${id}/roster`,
    submitRosterMarks: (id) => `/exams/exam-schedules/${id}/roster-marks`,
    registrations: '/exams/exam-registrations',
    registrationStatus: (id) => `/exams/exam-registrations/${id}/status`,
    markEntries: '/exams/mark-entries',
    verifyMarkEntries: (scheduleId) => `/exams/mark-entries/verify/${scheduleId}`,
    markCorrections: '/exams/mark-corrections',
    reviewMarkCorrection: (id) => `/exams/mark-corrections/${id}/review`,
    generateResults: '/exams/exam-results/generate',
    results: '/exams/exam-results',
  },

  attendance: {
    studentSummary: '/attendance/student/summary',
    studentMonthly: '/attendance/student/monthly',
    studentHistory: '/attendance/student/history',
    studentSubjects: '/attendance/student/subjects',
    studentSessions: '/attendance/student/sessions',
    markClass: '/attendance/mark-class',
    classRecords: '/attendance/class-records',
    classSummary: '/attendance/class-summary',
    facultyHistory: '/attendance/faculty-history',
    correctionRequests: '/attendance/correction-requests',
    approveCorrection: (id) => `/attendance/correction-requests/${id}/approve`,
    rejectCorrection: (id) => `/attendance/correction-requests/${id}/reject`,
  },


  leaves: {
    list: '/leaves',
  },

  mentorship: {
    myMentor: '/mentorship/my-mentor',
  },

  development: {
    myScores: '/development/my-scores',
  },

  discipline: {
    myRecords: '/discipline/my-records',
  },

  activities: {
    myAchievements: '/activities/achievements/my',
  },
};

export default apiClient;
