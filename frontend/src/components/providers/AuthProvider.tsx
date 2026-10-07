'use client';

import React, { ReactNode } from 'react';
import { AuthProvider as ContextAuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <ContextAuthProvider>
      <SocketProvider>{children}</SocketProvider>
    </ContextAuthProvider>
  );
};

export default AuthProvider;
