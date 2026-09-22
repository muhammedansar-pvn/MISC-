'use client';

import React, { ReactNode } from 'react';
import { AuthProvider as ContextAuthProvider } from '@/context/AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <ContextAuthProvider>{children}</ContextAuthProvider>;
};

export default AuthProvider;
