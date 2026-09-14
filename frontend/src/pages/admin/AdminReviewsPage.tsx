import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  Trash2,
  Search,
  Filter,
  Package,
  Calendar,
  User,
  MessageSquare,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Product, Review } from '../../types/api.types';
import { Spinner } from '../../components/common/Spinner';

export const AdminReviewsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  // Get all products to select from
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: adminApi.getProducts,
  });

  // Default select first product if none selected
  const activeProductId =
    selectedProductId !== null ? selectedProductId : products[0]?.id ?? null;

  // Get reviews for current product
  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['admin-reviews', activeProductId],
    queryFn: () => (activeProductId ? adminApi.getReviewsByProduct(activeProductId) : Promise.resolve([])),
    enabled: activeProductId !== null,
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => adminApi.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews', activeProductId] });
      setDeletingReview(null);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Failed to delete review.');
      setDeletingReview(null);
    },
  });

  const activeProduct = products.find((p) => p.id === activeProductId);

  const filteredReviews = reviews.filter((r) =>
    r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Reviews Moderation</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Inspect customer feedback, monitor ratings, and remove non-compliant content.
        </p>
      </div>

      {/* Product Selection & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-blue-500" />
            Select Product:
          </label>
          <select
            value={activeProductId ?? ''}
            onChange={(e) => setSelectedProductId(Number(e.target.value))}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs truncate"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search within reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loadingProducts || loadingReviews ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-slate-500">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No reviews found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no reviews submitted for{' '}
              <span className="font-semibold text-slate-600">{activeProduct?.name || 'this product'}</span>.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  {/* Rating Stars & Author */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= rev.rating ? 'fill-amber-400' : 'text-slate-200 fill-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-900">{rev.customerName || 'Verified Customer'}</span>
                    <span className="text-slate-300 text-xs">&bull;</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {rev.comment || <span className="italic text-slate-400">No written comment provided.</span>}
                  </p>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Review #{rev.id} &bull; Customer ID #{rev.customerId}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0">
                  <button
                    onClick={() => setDeletingReview(rev)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Review</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Are you sure you want to delete this review by{' '}
              <span className="font-semibold text-slate-800">"{deletingReview.customerName}"</span>?
              It will be permanently removed from the storefront.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingReview(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingReview.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
              >
                {deleteMutation.isPending ? <Spinner size="sm" /> : 'Delete Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
