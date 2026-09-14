import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Ticket,
  Plus,
  Search,
  Trash2,
  Calendar,
  X,
  AlertCircle,
  Percent,
  DollarSign,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Coupon, CreateCouponRequest } from '../../types/api.types';
import { Spinner } from '../../components/common/Spinner';

export const AdminCouponsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [formError, setFormError] = useState<string>('');

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: adminApi.getAllCoupons,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCouponRequest) => adminApi.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setIsCreateModalOpen(false);
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Failed to create coupon.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setDeletingCoupon(null);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Failed to delete coupon.');
      setDeletingCoupon(null);
    },
  });

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Coupons & Discounts</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create promotional promotional discount codes, validity windows, and usage caps.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search coupon code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
          {filteredCoupons.length} promotional codes
        </span>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-slate-500">Loading coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-20 text-center">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No coupons found</h3>
            <p className="text-xs text-slate-400 mt-1">Create promotional codes to incentivize orders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Coupon Code</th>
                  <th className="py-3.5 px-6">Discount</th>
                  <th className="py-3.5 px-6">Validity Period</th>
                  <th className="py-3.5 px-6">Usage Limit</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.endDate) < new Date();
                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                            {coupon.code}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg text-xs">
                          {Number(coupon.discountType) === 0 ? (
                            <>
                              <Percent className="w-3.5 h-3.5" />
                              {coupon.discountValue}% OFF
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-3.5 h-3.5" />
                              ${coupon.discountValue} OFF
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(coupon.startDate).toLocaleDateString()} &ndash;{' '}
                            {new Date(coupon.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-slate-700">
                          {coupon.timesUsed}{' '}
                          <span className="text-slate-400 font-normal">
                            / {coupon.usageLimit ? `${coupon.usageLimit} max` : 'Unlimited'}
                          </span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            !coupon.isActive || isExpired
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {coupon.isActive && !isExpired ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setDeletingCoupon(coupon)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create Promotional Coupon</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const code = (form.elements.namedItem('code') as HTMLInputElement).value.trim();
                const discountType = parseInt(
                  (form.elements.namedItem('discountType') as HTMLSelectElement).value,
                  10
                );
                const discountValue = parseFloat(
                  (form.elements.namedItem('discountValue') as HTMLInputElement).value
                );
                const startDate = (form.elements.namedItem('startDate') as HTMLInputElement).value;
                const endDate = (form.elements.namedItem('endDate') as HTMLInputElement).value;
                const usageLimitRaw = (form.elements.namedItem('usageLimit') as HTMLInputElement).value;
                const usageLimit = usageLimitRaw ? parseInt(usageLimitRaw, 10) : null;
                const isActive = (form.elements.namedItem('isActive') as HTMLInputElement).checked;

                createMutation.mutate({
                  code,
                  discountType,
                  discountValue,
                  startDate: new Date(startDate).toISOString(),
                  endDate: new Date(endDate).toISOString(),
                  usageLimit,
                  isActive,
                });
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  required
                  placeholder="e.g. SUMMER25"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type *</label>
                  <select
                    name="discountType"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="0">Percentage (%)</option>
                    <option value="1">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    name="discountValue"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 20"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    defaultValue={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Usage Limit (Optional)</label>
                <input
                  type="number"
                  name="usageLimit"
                  min="1"
                  placeholder="Leave empty for unlimited"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">Coupon is active immediately</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                  {createMutation.isPending ? <Spinner size="sm" /> : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Coupon</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Are you sure you want to delete coupon code{' '}
              <span className="font-mono font-bold text-slate-900">"{deletingCoupon.code}"</span>?
              Customers will no longer be able to apply this discount.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingCoupon(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingCoupon.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
              >
                {deleteMutation.isPending ? <Spinner size="sm" /> : 'Delete Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
