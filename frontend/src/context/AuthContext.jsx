import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../services/authService';
import { getToken, setToken, getUser, setUser, clearAuthStorage } from '../utils/token';

const AuthContext = createContext(null);

export const getRoleRedirectPath = (role) => {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'INSTITUTION':
      return '/institution';
    case 'FACULTY':
      return '/faculty';
    case 'STUDENT':
      return '/student';
    default:
      return '/login';
  }
};

export const AuthProvider = ({ children }) => {
  const [tokenState, setTokenState] = useState(getToken());
  const [userState, setUserState] = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync state on load
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
    setLoading(false);

    // Event listener for 401 unauthorized responses
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await apiLogin({ username, password });
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
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Invalid username or password';
      return { success: false, message };
    }
  };

  const logout = () => {
    clearAuthStorage();
    setTokenState(null);
    setUserState(null);
  };

  const value = {
    user: userState,
    token: tokenState,
    isAuthenticated: !!tokenState && !!userState,
    loading,
    login,
    logout,
    getRoleRedirectPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
