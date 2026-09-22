import { UserRole, UserStatus } from './auth';

export interface User {
  _id: string;
  name?: string;
  email: string;
  username?: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  mobile?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface UserQueryParams {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CreateUserInvitationPayload {
  name?: string;
  email: string;
  username?: string;
  role: UserRole;
  department?: string;
  mobile?: string;
  status?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  username?: string;
  role?: UserRole;
  department?: string;
  mobile?: string;
  status?: string;
}

export interface VerifyAdminUserOtpPayload {
  verificationId: string;
  otp: string;
}

export interface ResendAdminUserOtpPayload {
  verificationId: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  institutions: number;
  faculty: number;
  students: number;
}
