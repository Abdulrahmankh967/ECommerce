import { apiClient } from './client';
import {
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '../types/api.types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<Cart>('/Cart');
    return response.data;
  },

  addToCart: async (data: AddToCartRequest): Promise<Cart> => {
    const response = await apiClient.post<Cart>('/Cart/items', data);
    return response.data;
  },

  updateCartItem: async (cartItemId: number, data: UpdateCartItemRequest): Promise<Cart> => {
    const response = await apiClient.put<Cart>(`/Cart/items/${cartItemId}`, data);
    return response.data;
  },

  removeFromCart: async (cartItemId: number): Promise<Cart> => {
    const response = await apiClient.delete<Cart>(`/Cart/items/${cartItemId}`);
    return response.data;
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/Cart');
  },
};
