import { apiClient } from './client';
import { Wishlist } from '../types/api.types';

export const wishlistApi = {
  getWishlist: async (): Promise<Wishlist> => {
    const response = await apiClient.get<Wishlist>('/Wishlist');
    return response.data;
  },

  addToWishlist: async (productId: number): Promise<Wishlist> => {
    const response = await apiClient.post<Wishlist>(`/Wishlist/items/${productId}`);
    return response.data;
  },

  removeFromWishlist: async (wishlistItemId: number): Promise<Wishlist> => {
    const response = await apiClient.delete<Wishlist>(`/Wishlist/items/${wishlistItemId}`);
    return response.data;
  },

  clearWishlist: async (): Promise<void> => {
    await apiClient.delete('/Wishlist');
  },
};
