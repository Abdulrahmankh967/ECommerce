import { apiClient } from './client';
import {
  Product,
  Category,
  Review,
  CreateReviewRequest,
} from '../types/api.types';

export const productsApi = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<any>('/Product');
    const data = response.data;
    if (Array.isArray(data)) return data;
    return data?.items || data?.data || data?.products || [];
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/Product/${id}`);
    return response.data;
  },

  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(`/Product/category/${categoryId}`);
    return response.data;
  },

  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/Category');
    return response.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(`/Category/${id}`);
    return response.data;
  },

  getReviewsByProduct: async (productId: number): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>(`/Review/product/${productId}`);
    return response.data;
  },

  addReview: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post<Review>('/Review', data);
    return response.data;
  },

  deleteReview: async (reviewId: number): Promise<void> => {
    await apiClient.delete(`/Review/${reviewId}`);
  },
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(`/Product/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};
