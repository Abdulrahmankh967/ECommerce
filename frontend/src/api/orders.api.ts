import { apiClient } from './client';
import { OrderDetail, PlaceOrderRequest } from '../types/api.types';

export const ordersApi = {
  getOrders: async (): Promise<OrderDetail[]> => {
    const response = await apiClient.get<OrderDetail[]>('/Order');
    return response.data;
  },

  getOrderById: async (orderId: number): Promise<OrderDetail> => {
    const response = await apiClient.get<OrderDetail>(`/Order/${orderId}`);
    return response.data;
  },

  placeOrder: async (data: PlaceOrderRequest): Promise<OrderDetail> => {
    const response = await apiClient.post<OrderDetail>('/Order', data);
    return response.data;
  },
};
