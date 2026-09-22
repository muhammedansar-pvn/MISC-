import { AuthUser } from './auth';
import { Institution } from './institution';

export interface FacultyProfile {
  _id: string;
  userId?: string | AuthUser;
  facultyId?: string;
  nameEnglish?: string;
  nameArabic?: string;
  placeEnglish?: string;
  designation?: string;
  islamicQualification?: string;
  academicQualification?: string;
  joiningYear?: number;
  previousExperience?: string;
  contactNumber?: string;
  institutionId?: string | Institution;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface FacultyPayload {
  userId: string;
  facultyId: string;
  nameEnglish?: string;
  nameArabic?: string;
  placeEnglish?: string;
  designation?: string;
  islamicQualification?: string;
  academicQualification?: string;
  joiningYear?: number;
  previousExperience?: string;
  contactNumber?: string;
  institutionId?: string;
  [key: string]: any;
}
