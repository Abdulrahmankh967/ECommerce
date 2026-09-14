import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCart } from '../hooks/useCart';
import { addressesApi } from '../api/addresses.api';
import { ordersApi } from '../api/orders.api';
import { couponsApi } from '../api/coupons.api';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Spinner } from '../components/common/Spinner';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
  Plus,
  ArrowLeft,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { DiscountType } from '../types/api.types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const initialCoupon = (location.state as any)?.appliedCouponCode || '';

  const { cart, totalPrice, isLoading: isCartLoading } = useCart();
  const items = cart?.items || [];

  // Address Selection
  const { data: addresses = [], isLoading: isAddressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesApi.getAddresses,
  });

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address Form fields
  const [newTitle, setNewTitle] = useState('Home');
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newBuilding, setNewBuilding] = useState('');
  const [newPostal, setNewPostal] = useState('');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<
    'CreditCard' | 'PayPal' | 'CashOnDelivery'
  >('CreditCard');

  // Coupon
  const [couponCode, setCouponCode] = useState(initialCoupon);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<DiscountType | null>(null);
  const [orderError, setOrderError] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [isCouponApplying, setIsCouponApplying] = useState(false);

  // Set default address if available
  React.useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const defaultAddr =
        addresses.find((a) => a.isDefault) || addresses[0];

      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // If initial coupon passed, validate and apply
  React.useEffect(() => {
    if (initialCoupon) {
      setCouponCode(initialCoupon);
    }
  }, [initialCoupon]);

  // Apply coupon
  const handleApplyCoupon = async () => {
    const code = couponCode.trim();

    if (!code) {
      setCouponMessage('Please enter a coupon code.');
      setDiscountType(null);
      setDiscountValue(0);
      return;
    }

    try {
      setIsCouponApplying(true);
      setCouponMessage('');

      const coupon = await couponsApi.validateCoupon(code);

      if (!coupon.isActive) {
        setDiscountType(null);
        setDiscountValue(0);
        setCouponMessage('This coupon is not active.');
        return;
      }

      setDiscountType(coupon.discountType);
      setDiscountValue(coupon.discountValue);
      setCouponMessage('Coupon applied successfully.');
    } catch {
      setDiscountType(null);
      setDiscountValue(0);
      setCouponMessage('Invalid or expired coupon.');
    } finally {
      setIsCouponApplying(false);
    }
  };

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: ordersApi.placeOrder,

    onSuccess: (createdOrder) => {
      // Clear cart cache and orders cache
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      navigate(`/order-confirmation/${createdOrder.id}`, {
        state: { order: createdOrder },
      });
    },

    onError: (err: any) => {
      setOrderError(
        err?.response?.data?.message ||
        'Failed to place order. Please check stock or try again.'
      );
    },
  });

  // Calculate totals
  const couponDiscount =
    discountType === DiscountType.Percentage
      ? (totalPrice * discountValue) / 100
      : discountValue;

  const shippingFee = totalPrice > 99 || items.length === 0 ? 0 : 15;
  const taxAmount = (totalPrice - couponDiscount) * 0.08;
  const grandTotal = Math.max(
    0,
    totalPrice - couponDiscount + shippingFee + taxAmount
  );

  // Place Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');

    if (items.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }

    /*
     * If the user has no saved addresses, the new address form
     * is automatically considered active.
     *
     * This is important because showNewAddressForm may still be false
     * even though the form is displayed when addresses.length === 0.
     */
    if (showNewAddressForm || addresses.length === 0) {
      /*
       * Browser autofill can visually fill an input without triggering
       * React's onChange event. Therefore React state can remain empty
       * even though the user sees values inside the inputs.
       *
       * We use the React state first and fall back to the actual DOM value.
       */
      const inputs = document.querySelectorAll<HTMLInputElement>('input');

      const getInputValue = (
        placeholder: string,
        currentValue: string
      ) => {
        const input = Array.from(inputs).find(
          (el) => el.placeholder === placeholder
        );

        return currentValue || input?.value || '';
      };

      const recipient = getInputValue('Full name', newRecipient);
      const phone = getInputValue('+1 (555) 000-0000', newPhone);
      const city = getInputValue('e.g. Austin', newCity);
      const street = getInputValue('123 Technology Way', newStreet);

      if (!recipient || !phone || !city || !street) {
        setOrderError('Please complete all required address fields.');
        return;
      }

      try {
        const createdAddr = await addressesApi.createAddress({
          title: newTitle,
          recipientName: recipient,
          phone: phone,
          city: city,
          street: street,
          buildingNumber: newBuilding || undefined,
          postalCode: newPostal || undefined,
          isDefault: true,
        });

        setSelectedAddressId(createdAddr.id);
        setShowNewAddressForm(false);
      } catch {
        setOrderError('Failed to save new shipping address.');
        return;
      }
    } else if (!selectedAddressId) {
      setOrderError('Please select a shipping address.');
      return;
    }

    placeOrderMutation.mutate({
      customerAddressId: selectedAddressId!,
      paymentMethod,
      couponCode: couponCode.trim() || undefined,
    });
  };

  if (isCartLoading || isAddressesLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">
          Your cart is empty
        </h2>

        <p className="text-xs text-slate-500">
          Please add items to your cart before proceeding to checkout.
        </p>

        <Link to="/shop">
          <Button size="sm">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Secure Checkout
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Provide your shipping destination and preferred payment method.
          </p>
        </div>

        <Link
          to="/cart"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
      </div>

      {/* Error Message */}
      {orderError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      {/* Main Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left 8 Cols: Steps */}
        <div className="lg:col-span-8 space-y-6">

          {/* Step 1: Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Shipping Address
                </h3>
              </div>

              {!showNewAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Address</span>
                </button>
              )}
            </div>

            {/* Saved Addresses Selector */}
            {!showNewAddressForm && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">

                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedAddressId === addr.id
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">

                      <span className="text-xs font-bold text-slate-900">
                        {addr.title}
                      </span>

                      <input
                        type="radio"
                        name="selectedAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                    </div>

                    <p className="text-xs font-semibold text-slate-800">
                      {addr.recipientName}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      {addr.street}, {addr.city}
                    </p>

                    <p className="text-[11px] text-slate-400 mt-1">
                      Phone: {addr.phone}
                    </p>
                  </label>
                ))}
              </div>
            )}

            {/* New Address Input Form */}
            {(showNewAddressForm || addresses.length === 0) && (
              <div className="space-y-3 pt-2 border-t border-slate-100">

                <div className="flex items-center justify-between">

                  <span className="text-xs font-bold text-slate-700">
                    Enter Shipping Details:
                  </span>

                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Use Saved Address
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">

                  <Input
                    label="Address Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Home / Office"
                  />

                  <Input
                    label="Recipient Full Name"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    placeholder="Full name"
                    required
                  />

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <Input
                    label="Phone Number"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    required
                  />

                  <Input
                    label="City"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Austin"
                    required
                  />

                </div>

                <Input
                  label="Street Address"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="123 Technology Way"
                  required
                />

                <div className="grid grid-cols-2 gap-3">

                  <Input
                    label="Building / Suite (Optional)"
                    value={newBuilding}
                    onChange={(e) => setNewBuilding(e.target.value)}
                    placeholder="Suite 200"
                  />

                  <Input
                    label="Postal Code (Optional)"
                    value={newPostal}
                    onChange={(e) => setNewPostal(e.target.value)}
                    placeholder="78701"
                  />

                </div>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">

            <div className="flex items-center gap-2.5">

              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                2
              </div>

              <h3 className="text-base font-bold text-slate-900">
                Select Payment Method
              </h3>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">

              {/* Credit Card */}
              <label
                onClick={() => setPaymentMethod('CreditCard')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${paymentMethod === 'CreditCard'
                  ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
              >
                <div className="flex items-center justify-between">

                  <CreditCard className="w-5 h-5 text-blue-600" />

                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'CreditCard'}
                    onChange={() => setPaymentMethod('CreditCard')}
                    className="text-blue-600"
                  />

                </div>

                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Credit / Debit Card
                  </span>

                  <span className="text-[10px] text-slate-400">
                    Visa, Mastercard, Amex
                  </span>
                </div>
              </label>

              {/* PayPal */}
              <label
                onClick={() => setPaymentMethod('PayPal')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${paymentMethod === 'PayPal'
                  ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
              >
                <div className="flex items-center justify-between">

                  <Wallet className="w-5 h-5 text-blue-600" />

                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'PayPal'}
                    onChange={() => setPaymentMethod('PayPal')}
                    className="text-blue-600"
                  />

                </div>

                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    PayPal Express
                  </span>

                  <span className="text-[10px] text-slate-400">
                    Direct wallet checkout
                  </span>
                </div>
              </label>

              {/* Cash On Delivery */}
              <label
                onClick={() => setPaymentMethod('CashOnDelivery')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${paymentMethod === 'CashOnDelivery'
                  ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
              >
                <div className="flex items-center justify-between">

                  <Truck className="w-5 h-5 text-blue-600" />

                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'CashOnDelivery'}
                    onChange={() => setPaymentMethod('CashOnDelivery')}
                    className="text-blue-600"
                  />

                </div>

                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Cash on Delivery
                  </span>

                  <span className="text-[10px] text-slate-400">
                    Pay when delivered
                  </span>
                </div>
              </label>

            </div>
          </div>

        </div>

        {/* Right 4 Cols: Order Items & Summary */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">

          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
            Order Review ({items.length} items)
          </h3>

          {/* Items Preview */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100 text-xs">

            {items.map((item) => (
              <div
                key={item.id}
                className="pt-3 first:pt-0 flex items-center justify-between gap-2"
              >
                <div className="flex-1 pr-2">

                  <h4 className="font-bold text-slate-800 line-clamp-1">
                    {item.productName}
                  </h4>

                  <span className="text-[10px] text-slate-400">
                    Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                  </span>

                </div>

                <span className="font-bold text-slate-900 shrink-0">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}

          </div>

          {/* Coupon */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponMessage('');
                }}
                placeholder="Enter coupon code"
              />

              <Button
                type="button"
                onClick={handleApplyCoupon}
                isLoading={isCouponApplying}
                className="px-5 shrink-0"
              >
                Apply
              </Button>
            </div>

            {couponMessage && (
              <p
                className={`mt-2 text-xs ${couponMessage.includes('successfully')
                  ? 'text-emerald-600'
                  : 'text-red-500'
                  }`}
              >
                {couponMessage}
              </p>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">

            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>

              <span className="font-semibold text-slate-800">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Voucher Discount</span>

                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>

              <span className="font-semibold text-slate-800">
                {shippingFee === 0
                  ? 'Free'
                  : formatCurrency(shippingFee)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax</span>

              <span className="font-semibold text-slate-800">
                {formatCurrency(taxAmount)}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">

              <span className="text-sm font-bold text-slate-900">
                Total Due
              </span>

              <span className="text-2xl font-black text-blue-600">
                {formatCurrency(grandTotal)}
              </span>

            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            isLoading={placeOrderMutation.isPending}
            className="w-full py-3.5 rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold"
          >
            Confirm & Place Order
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Payment Guarantee</span>
          </div>

        </div>

      </div>

    </div>
  );
};