import { apiClient, API_ENDPOINTS } from '@/api/axios';
import {
  PaymentRecord,
  PaymentOrderResponse,
  CreatePaymentPayload,
  VerifyPaymentPayload,
  PaymentOverviewData,
  ApiResponse,
  PaginationParams,
} from '@/types';

export const getPayments = async (params: PaginationParams = {}): Promise<ApiResponse<PaymentRecord[]>> => {
  const response = await apiClient.get<ApiResponse<PaymentRecord[]>>(API_ENDPOINTS.payments.list, { params });
  return response.data;
};

export const getPaymentOverview = async (): Promise<ApiResponse<PaymentOverviewData>> => {
  const response = await apiClient.get<ApiResponse<PaymentOverviewData>>(API_ENDPOINTS.payments.overview);
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

export const createPaymentOrder = async (
  examRegistrationId: string
): Promise<ApiResponse<PaymentOrderResponse>> => {
  const response = await apiClient.post<ApiResponse<PaymentOrderResponse>>(API_ENDPOINTS.payments.createOrder, {
    examRegistrationId,
  });
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
  getPaymentOverview,
  getPaymentByTransactionId,
  createPaymentOrder,
  createPayment,
  verifyPayment,
};
