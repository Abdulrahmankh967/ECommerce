import { apiClient } from './client';
import {
  CustomerAddress,
  CreateCustomerAddressRequest,
  UpdateCustomerAddressRequest,
} from '../types/api.types';

export const addressesApi = {
  getAddresses: async (): Promise<CustomerAddress[]> => {
    const response = await apiClient.get<CustomerAddress[]>('/customers/addresses');
    return response.data;
  },

  getAddressById: async (addressId: number): Promise<CustomerAddress> => {
    const response = await apiClient.get<CustomerAddress>(`/customers/addresses/${addressId}`);
    return response.data;
  },

  createAddress: async (data: CreateCustomerAddressRequest): Promise<CustomerAddress> => {
    const response = await apiClient.post<CustomerAddress>('/customers/addresses', data);
    return response.data;
  },

  updateAddress: async (addressId: number, data: UpdateCustomerAddressRequest): Promise<CustomerAddress> => {
    const response = await apiClient.put<CustomerAddress>(`/customers/addresses/${addressId}`, data);
    return response.data;
  },

  deleteAddress: async (addressId: number): Promise<void> => {
    await apiClient.delete(`/customers/addresses/${addressId}`);
  },
};
