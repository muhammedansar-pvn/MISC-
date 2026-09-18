import apiClient from '../api/axios';

export const getPayments = async (params = {}) => {
  const response = await apiClient.get('/payments', { params });
  return response.data;
};

export const getPaymentByTransactionId = async (transactionId) => {
  const response = await apiClient.get(`/payments/${transactionId}`);
  return response.data;
};

export const createPayment = async (data) => {
  const response = await apiClient.post('/payments', data);
  return response.data;
};

export const verifyPayment = async (data) => {
  const response = await apiClient.post('/payments/verify', data);
  return response.data;
};

export default {
  getPayments,
  getPaymentByTransactionId,
  createPayment,
  verifyPayment,
};
