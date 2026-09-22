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
    accountSetupToken: (token: string) => `/auth/account-setup/${token}`,
    sendOtp: '/auth/send-otp',
  },

  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    userById: (id: string) => `/admin/users/${id}`,
    verifyOtp: '/admin/users/verify-otp',
    resendOtp: '/admin/users/resend-otp',
    userStatus: (id: string) => `/admin/users/${id}/status`,
    registerStudent: '/admin/students/register',
  },


  // NOTE: Express backend mounts at /academic/* (singular). Corrected from legacy /academics/*
  academic: {
    academicYears: '/academic/academic-years',
    academicYearById: (id: string) => `/academic/academic-years/${id}`,
    classes: '/academic/classes',
    classById: (id: string) => `/academic/classes/${id}`,
    subjects: '/academic/subjects',
    subjectById: (id: string) => `/academic/subjects/${id}`,
    syllabuses: '/academic/syllabuses',
    syllabusById: (id: string) => `/academic/syllabuses/${id}`,
  },

  institutions: {
    list: '/institutions',
    byId: (id: string) => `/institutions/${id}`,
  },

  students: {
    list: '/students',
    byId: (id: string) => `/students/${id}`,
    profile: '/students/profile',
  },

  faculty: {
    list: '/faculty',
    byId: (id: string) => `/faculty/${id}`,
  },

  cms: {
    articles: '/cms/articles',
    articleBySlug: (slug: string) => `/cms/articles/${slug}`,
    articleById: (id: string) => `/cms/articles/${id}`,
    resources: '/cms/resources',
    resourceById: (id: string) => `/cms/resources/${id}`,
    enquiries: '/cms/enquiries',
    enquiryStatus: (id: string) => `/cms/enquiries/${id}/status`,
  },

  events: {
    list: '/events/events',
    bySlug: (slug: string) => `/events/events/${slug}`,
    byId: (id: string) => `/events/events/${id}`,
    registrations: '/events/event-registrations',
  },

  payments: {
    list: '/payments',
    byTransactionId: (txId: string) => `/payments/${txId}`,
    verify: '/payments/verify',
  },

  exams: {
    list: '/exams/exams',
    byId: (id: string) => `/exams/exams/${id}`,
    schedules: '/exams/exam-schedules',
    scheduleById: (id: string) => `/exams/exam-schedules/${id}`,
    registrations: '/exams/exam-registrations',
    registrationStatus: (id: string) => `/exams/exam-registrations/${id}/status`,
    markEntries: '/exams/mark-entries',
    verifyMarkEntries: (scheduleId: string) => `/exams/mark-entries/verify/${scheduleId}`,
    generateResults: '/exams/exam-results/generate',
    results: '/exams/exam-results',
  },
} as const;

export default API_ENDPOINTS;
