import { apiClient } from './client';
import {
  LoginRequest,
  LoginResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  Customer,
  UpdateCustomerRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
} from '../types/api.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/Auth/login', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    const response = await apiClient.post<VerifyOTPResponse>('/Auth/verify-email', data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/Auth/refresh', data);
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/Auth/logout', { refreshToken });
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/Customers', data);
    return response.data;
  },

  getCurrentCustomer: async (): Promise<Customer> => {
    const response = await apiClient.get<Customer>('/Customers/me');
    return response.data;
  },

  updateCurrentCustomer: async (data: UpdateCustomerRequest): Promise<void> => {
    await apiClient.put('/Customers/me', data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/Customers/change-password', data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>('/Auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/Auth/reset-password', data);
    return response.data;
  },
};
