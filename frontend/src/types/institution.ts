import { AuthUser } from './auth';

export type InstitutionType = 'DIRECT' | 'COLLABORATING';

export interface Institution {
  _id: string;
  institutionName?: string;
  name?: string;
  institutionCode?: string;
  type: InstitutionType;
  address?: string;
  contactNumber?: string;
  email?: string;
  status: string;
  userId?: string | AuthUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstitutionPayload {
  institutionName: string;
  institutionCode: string;
  type: InstitutionType;
  address?: string;
  contactNumber?: string;
  email?: string;
  status?: string;
}
