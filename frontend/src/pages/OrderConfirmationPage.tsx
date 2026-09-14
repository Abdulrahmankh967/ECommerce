import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { CheckCircle, PackageCheck, ArrowRight, ShoppingBag, Truck } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const id = Number(orderId);
  const location = useLocation();

  // If passed from checkout state, use it immediately; else query API
  const stateOrder = (location.state as any)?.order;

  const { data: order = stateOrder, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !stateOrder && !isNaN(id) && id > 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      
      {/* Green Checkmark Success Header matching Screenshot Image 2, Frame 2 */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10">
          <CheckCircle className="w-12 h-12" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Payment & Order Confirmed
          </span>
          <h1 className="text-3xl font-black text-slate-900">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Your receipt and confirmation have been dispatched. We are preparing your devices for shipment.
          </p>
        </div>
      </div>

      {/* Order Card Summary */}
      {order && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Order Reference</span>
              <p className="text-base font-black text-slate-900">
                #ORD-{order.id.toString().padStart(4, '0')}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Order Date</span>
              <p className="text-xs font-semibold text-slate-800">{formatDate(order.orderDate)}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Payment Method</span>
              <p className="text-xs font-semibold text-slate-800">{order.paymentMethod || 'Credit Card'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Amount</span>
              <p className="text-base font-black text-blue-600">{formatCurrency(order.totalPrice)}</p>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Purchased Items ({order.items?.length || 0})
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{item.productName}</h4>
                    <span className="text-[11px] text-slate-400">
                      Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}
                    </span>
                  </div>
                  <span className="font-black text-slate-900">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Notice */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Fast Standard Delivery</span>
              <span className="text-slate-500">Estimated arrival within 2 to 4 business days.</span>
            </div>
          </div>

        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link to={`/orders/${id}`} className="w-full sm:w-auto">
          <Button
            className="w-full sm:w-auto px-6 py-3 rounded-xl"
            leftIcon={<PackageCheck className="w-4 h-4" />}
          >
            Track Order Status
          </Button>
        </Link>
        <Link to="/shop" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto px-6 py-3 rounded-xl"
            leftIcon={<ShoppingBag className="w-4 h-4" />}
          >
            Continue Shopping
          </Button>
        </Link>
      </div>

    </div>
  );
};
