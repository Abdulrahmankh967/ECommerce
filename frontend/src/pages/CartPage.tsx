import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { couponsApi } from '../api/coupons.api';
import { Coupon, DiscountType } from '../types/api.types';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';
import { 
  Trash2, 
  ArrowRight, 
  ShoppingBag, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { 
    cart, 
    totalPrice, 
    isLoading, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    isClearingCart
  } = useCart();

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const items = cart?.items || [];

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const coupon = await couponsApi.validateCoupon(couponCode.trim());
      if (!coupon.isActive) {
        setCouponError('This coupon is currently inactive or has expired.');
        return;
      }
      setAppliedCoupon(coupon);
      setCouponSuccess(`Coupon "${coupon.code}" applied successfully!`);
    } catch {
      setCouponError('Invalid coupon code. Please verify and try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  // Discount calculation
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === DiscountType.Percentage
      ? (totalPrice * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;

  const shippingFee = totalPrice > 99 || items.length === 0 ? 0 : 15;
  const taxAmount = (totalPrice - discountAmount) * 0.08;
  const grandTotal = Math.max(0, totalPrice - discountAmount + shippingFee + taxAmount);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10" />}
          title="Your shopping cart is empty"
          description="Looks like you haven't added any products to your cart yet. Explore our top-tier devices to get started."
          actionText="Explore All Products"
          onAction={() => navigate('/shop')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Your Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">Review items, apply promo vouchers, and proceed to checkout.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <button
            onClick={() => clearCart()}
            disabled={isClearingCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Main Grid: Items Table & Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Cart Items Table matching Screenshot Image 2, Frame 3 */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3">Product</th>
                  <th className="pb-3 text-center">Unit Price</th>
                  <th className="pb-3 text-center">Quantity</th>
                  <th className="pb-3 text-right">Subtotal</th>
                  <th className="pb-3 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Title & Link */}
                    <td className="py-4">
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-bold text-slate-900 hover:text-blue-600 block line-clamp-2"
                      >
                        {item.productName}
                      </Link>
                      <span className="text-[10px] text-slate-400">ID: #{item.productId}</span>
                    </td>

                    {/* Unit Price */}
                    <td className="py-4 text-center font-semibold text-slate-700">
                      {formatCurrency(item.unitPrice)}
                    </td>

                    {/* Quantity Stepper */}
                    <td className="py-4 text-center">
                      <div className="inline-flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity({ cartItemId: item.id, quantity: item.quantity - 1 });
                            }
                          }}
                          disabled={item.quantity <= 1}
                          className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-bold text-slate-900 text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity({ cartItemId: item.id, quantity: item.quantity + 1 })
                          }
                          className="px-2.5 py-1 text-slate-500 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Subtotal */}
                    <td className="py-4 text-right font-black text-slate-900">
                      {formatCurrency(item.subtotal)}
                    </td>

                    {/* Trash Button */}
                    <td className="py-4 text-right">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Promo Code Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Tag className="w-4 h-4 text-blue-600" />
              <span>Promo Code / Voucher</span>
            </div>

            {appliedCoupon ? (
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900">{appliedCoupon.code}</span>
                  <p className="text-[11px] text-blue-700">
                    {appliedCoupon.discountType === DiscountType.Percentage
                      ? `${appliedCoupon.discountValue}% Off Applied`
                      : `$${appliedCoupon.discountValue} Off Applied`}
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase font-bold"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={couponLoading}
                    className="rounded-xl px-4 text-xs shrink-0"
                  >
                    Apply
                  </Button>
                </div>

                {couponError && (
                  <div className="flex items-center gap-1 text-[11px] text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </div>
                )}
                {couponSuccess && (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponSuccess}</span>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Order Summary Card matching Screenshot Image 2, Frame 3 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">{formatCurrency(totalPrice)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-800">
                  {shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(taxAmount)}</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Price</span>
                <span className="text-2xl font-black text-blue-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <Button
              onClick={() => {
                navigate('/checkout', {
                  state: {
                    appliedCouponCode: appliedCoupon?.code,
                  },
                });
              }}
              className="w-full py-3.5 rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold mt-4"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Checkout
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted & Protected</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
