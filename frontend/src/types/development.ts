export type DevelopmentTerm = 'TERM_1' | 'TERM_2' | 'TERM_3' | 'ANNUAL';

export interface LinguisticScore {
  arabic: number;
  english: number;
  urdu: number;
  overall: number;
}

export interface DevelopmentAcademicYear {
  _id: string;
  yearName: string;
  yearCode: string;
}

export interface StudentDevelopmentScore {
  _id: string;
  studentId: string;
  academicYearId: DevelopmentAcademicYear;
  term: DevelopmentTerm;
  academicScore: number;
  linguisticScore: LinguisticScore;
  spiritualScore: number;
  skillScore: number;
  leadershipScore: number;
  overallDevelopmentScore: number;
  remarks?: string;
  evaluatedBy?: {
    _id: string;
    facultyId?: string;
    department?: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}
