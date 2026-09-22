'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, getRoleRedirectPath } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: (UserRole | string)[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      user &&
      !allowedRoles.includes(user.role)
    ) {
      const redirectPath = getRoleRedirectPath(user.role);
      if (pathname !== redirectPath) {
        router.replace(redirectPath);
      }
    }
  }, [isAuthenticated, user, loading, allowedRoles, router, pathname]);

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
    return null;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    user &&
    !allowedRoles.includes(user.role)
  ) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
