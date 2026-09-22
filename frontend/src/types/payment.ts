import { AuthUser } from './auth';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type Payment = PaymentRecord;

export interface PaymentRecord {
  _id: string;
  transactionId: string;
  amount: number;
  paymentType: string;
  status: PaymentStatus;
  userId?: string | AuthUser;
  studentId?: string;
  institutionId?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CreatePaymentPayload {
  amount: number;
  paymentType: string;
  studentId?: string;
  institutionId?: string;
  notes?: string;
}

export interface VerifyPaymentPayload {
  transactionId: string;
  [key: string]: any;
}
