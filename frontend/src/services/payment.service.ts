import { apiClient, API_ENDPOINTS } from '@/lib/api';
import {
  PaymentRecord,
  CreatePaymentPayload,
  VerifyPaymentPayload,
  ApiResponse,
  PaginationParams,
} from '@/types';

export const getPayments = async (params: PaginationParams = {}): Promise<ApiResponse<PaymentRecord[]>> => {
  const response = await apiClient.get<ApiResponse<PaymentRecord[]>>(API_ENDPOINTS.payments.list, { params });
  return response.data;
};

export const getPaymentByTransactionId = async (
  transactionId: string
): Promise<ApiResponse<PaymentRecord>> => {
  const response = await apiClient.get<ApiResponse<PaymentRecord>>(
    API_ENDPOINTS.payments.byTransactionId(transactionId)
  );
  return response.data;
};

export const createPayment = async (data: CreatePaymentPayload): Promise<ApiResponse<PaymentRecord>> => {
  const response = await apiClient.post<ApiResponse<PaymentRecord>>(API_ENDPOINTS.payments.list, data);
  return response.data;
};

export const verifyPayment = async (data: VerifyPaymentPayload): Promise<ApiResponse<PaymentRecord>> => {
  const response = await apiClient.post<ApiResponse<PaymentRecord>>(API_ENDPOINTS.payments.verify, data);
  return response.data;
};

export default {
  getPayments,
  getPaymentByTransactionId,
  createPayment,
  verifyPayment,
};
