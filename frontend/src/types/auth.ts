export type UserRole = 'ADMIN' | 'INSTITUTION' | 'FACULTY' | 'STUDENT';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'INVITED' | 'PENDING_SETUP' | 'BLOCKED' | 'SUSPENDED';

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  username?: string;
  role: UserRole;
  status?: UserStatus;
  mobile?: string;
  department?: string;
  [key: string]: any;
}

export interface LoginPayload {
  username?: string;
  email?: string;
  password?: string;
  requires2FA?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
  requires2FA?: boolean;
  verificationId?: string;
  email?: string;
  requiresEmailVerification?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role?: UserRole;
}

export interface VerifyEmailOtpPayload {
  email: string;
  otp: string;
}

export interface ResendEmailOtpPayload {
  email: string;
}

export interface Verify2FAOtpPayload {
  verificationId: string;
  otp: string;
}

export interface Resend2FAOtpPayload {
  verificationId: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password?: string;
  confirmPassword?: string;
}

export interface SetPasswordPayload {
  token: string;
  password?: string;
  confirmPassword?: string;
}

export interface AccountSetupPayload {
  token: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

export interface SendOtpPayload {
  identifier: string;
  purpose: string;
}

export interface VerifyOtpPayload {
  identifier?: string;
  otp: string;
  purpose?: string;
  verificationId?: string;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  redirectTo?: string;
  requires2FA?: boolean;
  verificationId?: string;
  email?: string;
  requiresEmailVerification?: boolean;
  message?: string;
}

export interface Verify2FAResult {
  success: boolean;
  user?: AuthUser;
  redirectTo?: string;
  message?: string;
}

export interface Resend2FAResult {
  success: boolean;
  message?: string;
  verificationId?: string;
  email?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  verify2FA: (verificationId: string, otp: string) => Promise<Verify2FAResult>;
  resend2FA: (verificationId: string) => Promise<Resend2FAResult>;
  logout: () => void;
  getRoleRedirectPath: (role?: string) => string;
}

