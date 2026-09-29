export type ActivityCategory =
  | 'SPEECH'
  | 'ESSAY'
  | 'DEBATE'
  | 'KHUTBA'
  | 'QIRAATH'
  | 'SPORTS'
  | 'OTHER';

export type ActivityStage =
  | 'PARTICIPATION'
  | 'PERFORMANCE'
  | 'DISTRICT'
  | 'STATE'
  | 'NATIONAL'
  | 'OTHER';

export type AchievementRank =
  | 'FIRST'
  | 'SECOND'
  | 'THIRD'
  | 'CONSOLATION'
  | 'PARTICIPATION'
  | 'NONE';

export type AchievementStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface ActivityCatalogItem {
  _id: string;
  name: string;
  category: ActivityCategory;
  description?: string;
}

export interface ActivityAcademicYear {
  _id: string;
  yearName: string;
  yearCode: string;
}

export interface StudentAchievement {
  _id: string;
  studentId: string;
  activityId: ActivityCatalogItem;
  academicYearId: ActivityAcademicYear;
  stage: ActivityStage;
  marksObtained: number;
  rankPosition: AchievementRank;
  certificateUrl?: string;
  status: AchievementStatus;
  remarks?: string;
  verifiedBy?: {
    _id: string;
    name: string;
    email?: string;
  } | string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}
