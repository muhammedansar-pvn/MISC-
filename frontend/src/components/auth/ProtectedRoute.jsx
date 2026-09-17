import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getRoleRedirectPath } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8F5]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#2F7C7A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#132238]">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // If authenticated user tries to access unauthorized role route, redirect to their role dashboard
    const redirectPath = getRoleRedirectPath(user?.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
