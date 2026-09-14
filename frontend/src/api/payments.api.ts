import { apiClient } from './client';
import { Payment } from '../types/api.types';

export const paymentsApi = {
  getPaymentByOrderId: async (orderId: number): Promise<Payment> => {
    const response = await apiClient.get<Payment>(`/Payment/order/${orderId}`);
    return response.data;
  },
};
