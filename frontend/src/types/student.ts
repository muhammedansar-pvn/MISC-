import { AuthUser } from './auth';
import { ClassModel } from './academic';
import { Institution } from './institution';

export interface StudentProfile {
  _id: string;
  userId?: string | AuthUser;
  registrationNumber?: string;
  nameEnglish?: string;
  nameArabic?: string;
  placeEnglish?: string;
  dateOfBirth?: string;
  admissionYear?: number;
  classId?: string | ClassModel;
  institutionId?: string | Institution;
  contactNumber?: string;
  fatherName?: string;
  motherName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface StudentPayload {
  userId: string;
  nameEnglish: string;
  nameArabic?: string;
  placeEnglish?: string;
  dateOfBirth: string;
  admissionYear: number;
  classId?: string;
  institutionId?: string;
  contactNumber?: string;
  fatherName: string;
  motherName: string;
  [key: string]: any;
}

export interface RegisterStudentFullPayload {
  name?: string;
  email: string;
  username?: string;
  mobile?: string;
  nameEnglish: string;
  nameArabic?: string;
  placeEnglish?: string;
  placeArabic?: string;
  dateOfBirth: string;
  admissionYear: number;
  classId?: string;
  institutionId?: string;
  contactNumber?: string;
  fatherName: string;
  motherName: string;
  photo?: string;
}

export interface RegisterStudentFullResponse {
  student: StudentProfile;
  verificationId?: string;
  maskedEmail?: string;
  expiresAt?: string;
}

