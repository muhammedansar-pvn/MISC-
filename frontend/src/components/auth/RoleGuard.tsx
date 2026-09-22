'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: (UserRole | string)[];
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
