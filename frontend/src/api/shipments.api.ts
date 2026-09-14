import { apiClient } from './client';
import { Shipment } from '../types/api.types';

export const shipmentsApi = {
  getShipmentByOrderId: async (orderId: number): Promise<Shipment> => {
    const response = await apiClient.get<Shipment>(`/Shipment/order/${orderId}`);
    return response.data;
  },
};
