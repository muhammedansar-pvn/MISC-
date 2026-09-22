import { apiClient, API_ENDPOINTS } from '@/lib/api';
import {
  LoginPayload,
  LoginResponse,
  Verify2FAOtpPayload,
  Resend2FAOtpPayload,
  SetPasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  SendOtpPayload,
  VerifyOtpPayload,
  AccountSetupPayload,
  RegisterPayload,
  VerifyEmailOtpPayload,
  ResendEmailOtpPayload,
  ApiResponse,
} from '@/types';

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, payload);
  return response.data;
};

export const verify2FAOtp = async (payload: Verify2FAOtpPayload): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.verifyOtp, payload);
  return response.data;
};

export const resend2FAOtp = async (payload: Resend2FAOtpPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.auth.resendOtp, payload);
  return response.data;
};

export const setPassword = async (payload: SetPasswordPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.auth.setPassword, payload);
  return response.data;
};

export const forgotPassword = async (payload: ForgotPasswordPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.auth.forgotPassword, payload);
  return response.data;
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.auth.resetPassword, payload);
  return response.data;
};

export const sendOtp = async (payload: SendOtpPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.auth.sendOtp, payload);
  return response.data;
};

export const verifyOtp = async (payload: VerifyOtpPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.auth.verifyOtp, payload);
  return response.data;
};

export const verifyAccountSetupToken = async (token: string): Promise<ApiResponse> => {
  const response = await apiClient.get<ApiResponse>(API_ENDPOINTS.auth.accountSetupToken(token));
  return response.data;
};

export const accountSetup = async (payload: AccountSetupPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.auth.accountSetup, payload);
  return response.data;
};

export const register = async (payload: RegisterPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.auth.register, payload);
  return response.data;
};

export const verifyEmailOtp = async (payload: VerifyEmailOtpPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.auth.verifyEmailOtp, payload);
  return response.data;
};

export const resendEmailOtp = async (payload: ResendEmailOtpPayload): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.auth.resendEmailOtp, payload);
  return response.data;
};

export default {
  login,
  verify2FAOtp,
  resend2FAOtp,
  setPassword,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  verifyAccountSetupToken,
  accountSetup,
  register,
  verifyEmailOtp,
  resendEmailOtp,
};
