import { AuthUser } from '@/types';

const TOKEN_KEY = 'misc_auth_token';
const USER_KEY = 'misc_auth_user';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    // Ignore storage errors
  }
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage errors
  }
};

export const getUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setUser = (user: AuthUser): void => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch {
    // Ignore storage errors
  }
};

export const removeUser = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // Ignore storage errors
  }
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const clearAuthStorage = (): void => {
  removeToken();
  removeUser();
};

export default {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  isAuthenticated,
  clearAuthStorage,
};
