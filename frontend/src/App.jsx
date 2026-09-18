import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AcademicsPage from './pages/AcademicsPage';
import InstitutionsPage from './pages/InstitutionsPage';
import DownloadsPage from './pages/DownloadsPage';
import ExaminationPage from './pages/ExaminationPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth Pages & Components
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AccountSetupPage from './pages/AccountSetupPage';

// Admin Module Components & Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminUserDetailsPage from './pages/AdminUserDetailsPage';
import AdminInstitutionsPage from './pages/AdminInstitutionsPage';
import AdminAcademicPage from './pages/AdminAcademicPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminFacultyPage from './pages/AdminFacultyPage';
import AdminCMSPage from './pages/AdminCMSPage';
import AdminEventsPage from './pages/AdminEventsPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import AdminExamsPage from './pages/AdminExamsPage';
import AdminResultsPage from './pages/AdminResultsPage';

// Other Role Dashboard Placeholders
import InstitutionDashboardPage from './pages/InstitutionDashboardPage';
import FacultyDashboardPage from './pages/FacultyDashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Portal Layout Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="academics" element={<AcademicsPage />} />
            <Route path="institutions" element={<InstitutionsPage />} />
            <Route path="downloads" element={<DownloadsPage />} />
            <Route path="examination" element={<ExaminationPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/account-setup/:token" element={<AccountSetupPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="users/:id" element={<AdminUserDetailsPage />} />
            <Route path="institutions" element={<AdminInstitutionsPage />} />
            <Route path="academic" element={<AdminAcademicPage />} />
            <Route path="students" element={<AdminStudentsPage />} />
            <Route path="faculty" element={<AdminFacultyPage />} />
            <Route path="cms" element={<AdminCMSPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="exams" element={<AdminExamsPage />} />
            <Route path="results" element={<AdminResultsPage />} />
          </Route>

          {/* Other Role-Based Dashboard Routes */}
          <Route
            path="/institution/*"
            element={
              <ProtectedRoute allowedRoles={['INSTITUTION']}>
                <InstitutionDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/*"
            element={
              <ProtectedRoute allowedRoles={['FACULTY']}>
                <FacultyDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
