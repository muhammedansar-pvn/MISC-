export type DisciplineSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DisciplineClass {
  _id: string;
  name: string;
  code: string;
}

export interface DisciplineReporter {
  _id: string;
  name: string;
  email?: string;
}

export interface DisciplineRecord {
  _id: string;
  studentId: string;
  classId?: DisciplineClass | string;
  incidentDate: string;
  incidentType: string;
  severity: DisciplineSeverity;
  demeritPoints: number;
  description?: string;
  actionTaken?: string;
  reportedBy?: DisciplineReporter | string;
  parentNotified: boolean;
  parentNotifiedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolutionRemarks?: string;
  createdAt: string;
  updatedAt: string;
}
