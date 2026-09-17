import apiClient from '../api/axios';

export const login = async ({ username, password }) => {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data;
};

export const setPassword = async ({ token, password, confirmPassword }) => {
  const response = await apiClient.post('/auth/set-password', { token, password, confirmPassword });
  return response.data;
};

export const forgotPassword = async ({ email }) => {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async ({ token, password, confirmPassword }) => {
  const response = await apiClient.post('/auth/reset-password', { token, password, confirmPassword });
  return response.data;
};

export const sendOtp = async ({ identifier, purpose }) => {
  const response = await apiClient.post('/auth/send-otp', { identifier, purpose });
  return response.data;
};

export const verifyOtp = async ({ identifier, otp, purpose }) => {
  const response = await apiClient.post('/auth/verify-otp', { identifier, otp, purpose });
  return response.data;
};

export const verifyAccountSetupToken = async (token) => {
  const response = await apiClient.get(`/auth/account-setup/${token}`);
  return response.data;
};

export const accountSetup = async ({ token, username, password, confirmPassword }) => {
  const response = await apiClient.post('/auth/account-setup', { token, username, password, confirmPassword });
  return response.data;
};

export default {
  login,
  setPassword,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  verifyAccountSetupToken,
  accountSetup,
};
