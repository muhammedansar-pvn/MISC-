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
    registerStudent: '/admin/students/register',
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
  },

  faculty: {
    list: '/faculty',
    byId: (id) => `/faculty/${id}`,
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
    registrations: '/exams/exam-registrations',
    registrationStatus: (id) => `/exams/exam-registrations/${id}/status`,
    markEntries: '/exams/mark-entries',
    verifyMarkEntries: (scheduleId) => `/exams/mark-entries/verify/${scheduleId}`,
    generateResults: '/exams/exam-results/generate',
    results: '/exams/exam-results',
  },

  attendance: {
    studentSummary: '/attendance/student/summary',
    studentMonthly: '/attendance/student/monthly',
    studentHistory: '/attendance/student/history',
  },
};

export default apiClient;
