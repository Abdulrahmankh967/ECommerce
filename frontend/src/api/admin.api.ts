import { apiClient } from './client';
import {
  Product,
  Category,
  OrderDetail,
  Customer,
  Coupon,
  Supplier,
  Shipment,
  Payment,
  Review,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  CreateSupplierRequest,
  CreateCouponRequest,
  UpdateShipmentRequest,
} from '../types/api.types';

export const adminApi = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<any>('/Product');
    const data = response.data;
    if (Array.isArray(data)) return data;
    return data?.items || data?.data || data?.products || [];
  },
  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post<Product>('/Product', data);
    return response.data;
  },
  updateProduct: async (id: number, data: UpdateProductRequest): Promise<Product> => {
    const response = await apiClient.put<Product>(`/Product/${id}`, data);
    return response.data;
  },
  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/Product/${id}`);
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/Category');
    return response.data;
  },
  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<Category>('/Category', data);
    return response.data;
  },
  updateCategory: async (id: number, data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<Category>(`/Category/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/Category/${id}`);
  },

  // Orders
  getAllOrders: async (): Promise<OrderDetail[]> => {
    const response = await apiClient.get<OrderDetail[]>('/Order/All');
    return response.data;
  },
  getOrderById: async (orderId: number): Promise<OrderDetail> => {
    const response = await apiClient.get<OrderDetail>(`/Order/${orderId}`);
    return response.data;
  },

  // Customers
  getAllCustomers: async (): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>('/Customers');
    return response.data;
  },
  deleteCustomer: async (id: number): Promise<void> => {
    await apiClient.delete(`/Customers/${id}`);
  },

  // Coupons
  getAllCoupons: async (): Promise<Coupon[]> => {
    const response = await apiClient.get<Coupon[]>('/Coupon');
    return response.data;
  },
  createCoupon: async (data: CreateCouponRequest): Promise<Coupon> => {
    const response = await apiClient.post<Coupon>('/Coupon', data);
    return response.data;
  },
  updateCoupon: async (id: number, data: CreateCouponRequest): Promise<Coupon> => {
    const response = await apiClient.put<Coupon>(`/Coupon/${id}`, data);
    return response.data;
  },
  deleteCoupon: async (id: number): Promise<void> => {
    await apiClient.delete(`/Coupon/${id}`);
  },

  // Suppliers
  getAllSuppliers: async (): Promise<Supplier[]> => {
    const response = await apiClient.get<Supplier[]>('/Supplier');
    return response.data;
  },
  createSupplier: async (data: CreateSupplierRequest): Promise<Supplier> => {
    const response = await apiClient.post<Supplier>('/Supplier', data);
    return response.data;
  },
  updateSupplier: async (id: number, data: CreateSupplierRequest): Promise<Supplier> => {
    const response = await apiClient.put<Supplier>(`/Supplier/${id}`, data);
    return response.data;
  },
  deleteSupplier: async (id: number): Promise<void> => {
    await apiClient.delete(`/Supplier/${id}`);
  },

  // Shipments
  getShipmentByOrderId: async (orderId: number): Promise<Shipment | null> => {
    try {
      const response = await apiClient.get<Shipment>(`/Shipment/order/${orderId}`);
      return response.data;
    } catch {
      return null;
    }
  },
  updateShipmentStatus: async (id: number, data: UpdateShipmentRequest): Promise<Shipment> => {
    const response = await apiClient.put<Shipment>(`/Shipment/${id}`, data);
    return response.data;
  },

  // Payments
  getPaymentByOrderId: async (orderId: number): Promise<Payment | null> => {
    try {
      const response = await apiClient.get<Payment>(`/Payment/order/${orderId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  // Reviews
  getReviewsByProduct: async (productId: number): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>(`/Review/product/${productId}`);
    return response.data;
  },
  deleteReview: async (id: number): Promise<void> => {
    await apiClient.delete(`/Review/${id}`);
  },
};
