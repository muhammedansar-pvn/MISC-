'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  login as apiLogin,
  verify2FAOtp as apiVerify2FA,
  resend2FAOtp as apiResend2FA,
} from '@/services/auth.service';
import {
  getToken,
  setToken,
  getUser,
  setUser,
  clearAuthStorage,
} from '@/utils/token';
import {
  AuthUser,
  AuthContextType,
  LoginResult,
  Verify2FAResult,
  Resend2FAResult,
} from '@/types';

export const getRoleRedirectPath = (role?: string): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'PRINCIPAL':
      return '/principal';
    case 'HOD':
      return '/hod';
    case 'ASATITHA':
    case 'FACULTY':
      return '/faculty';
    case 'PARENT':
      return '/parent';
    case 'STUDENT':
      return '/student';
    case 'INSTITUTION':
      return '/admin';
    default:
      return '/login';
  }
};

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [tokenState, setTokenState] = useState<string | null>(null);
  const [userState, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const logout = () => {
    clearAuthStorage();
    setTokenState(null);
    setUserState(null);
  };

  useEffect(() => {
    // Sync state on load in client environment
    try {
      const token = getToken();
      const user = getUser();
      if (token && user) {
        setTokenState(token);
        setUserState(user);
      } else {
        clearAuthStorage();
        setTokenState(null);
        setUserState(null);
      }
    } catch {
      clearAuthStorage();
      setTokenState(null);
      setUserState(null);
    } finally {
      setLoading(false);
    }

    // Event listener for 401 unauthorized responses from API client
    const handleUnauthorized = () => {
      logout();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
      }
    };
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    try {
      const response = await apiLogin({ username, password });
      setLoading(false);

      if (response.success && response.requires2FA) {
        return {
          success: false,
          requires2FA: true,
          verificationId: response.verificationId,
          email: response.email,
          message: response.message,
        };
      }

      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        setTokenState(response.token);
        setUserState(response.user);
        return {
          success: true,
          user: response.user,
          redirectTo: getRoleRedirectPath(response.user.role),
        };
      }

      return { success: false, message: response.message || 'Login failed' };
    } catch (error: any) {
      setLoading(false);
      const data = error.response?.data;
      if (data?.requiresEmailVerification) {
        return {
          success: false,
          requiresEmailVerification: true,
          email: data.email,
          message: data.message || 'Email verification required',
        };
      }
      const message = data?.message || 'Invalid username or password';
      return { success: false, message };
    }
  };

  const verify2FA = async (verificationId: string, otp: string): Promise<Verify2FAResult> => {
    setLoading(true);
    try {
      const response = await apiVerify2FA({ verificationId, otp });
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        setTokenState(response.token);
        setUserState(response.user);
        setLoading(false);
        return {
          success: true,
          user: response.user,
          redirectTo: getRoleRedirectPath(response.user.role),
        };
      }
      setLoading(false);
      return { success: false, message: response.message || '2FA verification failed' };
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || 'Invalid OTP verification code';
      return { success: false, message };
    }
  };

  const resend2FA = async (verificationId: string): Promise<Resend2FAResult> => {
    try {
      const response: any = await apiResend2FA({ verificationId });
      return {
        success: response.success,
        message: response.message,
        verificationId: response.verificationId,
        email: response.email,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      return { success: false, message };
    }
  };

  const value: AuthContextType = {
    user: userState,
    token: tokenState,
    isAuthenticated: !!tokenState && !!userState,
    loading,
    isLoading: loading,
    login,
    verify2FA,
    resend2FA,
    logout,
    getRoleRedirectPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
