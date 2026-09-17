const TOKEN_KEY = 'misc_auth_token';
const USER_KEY = 'misc_auth_user';

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const clearAuthStorage = () => {
  removeToken();
  removeUser();
};
