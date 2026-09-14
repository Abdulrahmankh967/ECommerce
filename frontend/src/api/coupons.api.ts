import { apiClient } from './client';
import { Coupon } from '../types/api.types';

export const couponsApi = {
  getCouponByCode: async (code: string): Promise<Coupon> => {
    const response = await apiClient.get<Coupon>(`/Coupon/code/${code}`);
    return response.data;
  },
  validateCoupon: async (code: string): Promise<Coupon> => {
    const response = await apiClient.post<Coupon>(`/Coupon/validate`, { code });
    return response.data;
  },
};
