import { AuthUser } from './auth';

export type PaymentStatus = 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export type Payment = PaymentRecord;

export interface PaymentRecord {
  _id: string;
  transactionId: string;
  amount: number;
  paymentType: string;
  status: PaymentStatus;
  userId?: string | AuthUser;
  studentId?: string | any;
  parentId?: string | any;
  institutionId?: string;
  examRegistrationId?: string | any;
  gateway?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  paymentMethod?: string;
  paidAt?: string;
  failureReason?: string;
  receipt?: string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface PaymentOrderResponse {
  orderId: string;
  transactionId: string;
  paymentId: string;
  keyId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  examTitle: string;
  examCode?: string;
  studentName: string;
  rollNumber: string;
  institutionName: string;
  freeExam?: boolean;
  message?: string;
}

export interface CreatePaymentPayload {
  amount?: number;
  paymentType: string;
  examRegistrationId?: string;
  studentId?: string;
  institutionId?: string;
  notes?: string;
}

export interface VerifyPaymentPayload {
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  gateway?: string;
  gatewaySignature?: string;
  [key: string]: any;
}

export interface PaymentOverviewData {
  totalRevenue: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  examFeePayments: number;
}
