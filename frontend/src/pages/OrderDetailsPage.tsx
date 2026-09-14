import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { shipmentsApi } from '../api/shipments.api';
import { paymentsApi } from '../api/payments.api';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { 
  ArrowLeft, 
  Printer, 
  Check, 
  Package, 
  Truck, 
  CreditCard, 
  Clock, 
  CheckCircle2
} from 'lucide-react';

export const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const id = Number(orderId);

  // Fetch order details
  const { data: order, isLoading: isOrderLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !isNaN(id) && id > 0,
  });

  // Fetch shipment tracking if available
  const { data: shipment } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => shipmentsApi.getShipmentByOrderId(id),
    enabled: !isNaN(id) && id > 0,
    retry: false,
  });

  // Fetch payment details if available
  const { data: payment } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentsApi.getPaymentByOrderId(id),
    enabled: !isNaN(id) && id > 0,
    retry: false,
  });

  if (isOrderLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">The requested order does not exist or you do not have permission to view it.</p>
        <Link to="/account?tab=orders">
          <Button size="sm">Back to My Orders</Button>
        </Link>
      </div>
    );
  }

  // Delivery status step determination
  const statusStr = (shipment?.status || order.shipmentStatus || 'Processing').toLowerCase();
  
  let currentStep = 1;
  if (statusStr.includes('delivered')) currentStep = 5;
  else if (statusStr.includes('out') || statusStr.includes('transit')) currentStep = 4;
  else if (statusStr.includes('ship')) currentStep = 3;
  else if (statusStr.includes('confirm') || statusStr.includes('process')) currentStep = 2;

  const timelineSteps = [
    { title: 'Order Placed', desc: formatDate(order.orderDate) },
    { title: 'Confirmed', desc: 'Payment Approved' },
    { title: 'Shipped', desc: shipment?.carrier || 'Carrier Dispatched' },
    { title: 'Out for Delivery', desc: 'With local courier' },
    { title: 'Delivered', desc: formatDate(shipment?.actualDeliveryDate || shipment?.estimatedDeliveryDate) },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Bar matching Screenshot Image 2, Frame 8 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link
            to="/account?tab=orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders List</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Order #ORD-{order.id.toString().padStart(4, '0')}
            </h1>
            <Badge variant="primary" size="md">
              {shipment?.status || order.shipmentStatus || 'Processing'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">Placed on {formatDateTime(order.orderDate)}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          leftIcon={<Printer className="w-4 h-4" />}
        >
          Print Invoice
        </Button>
      </div>

      {/* Interactive Delivery Timeline matching Screenshot Image 2, Frame 8 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900">Shipment Tracking Timeline</h3>

        <div className="relative">
          {/* Timeline Bar */}
          <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (timelineSteps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Timeline Points */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative z-10">
            {timelineSteps.map((step, idx) => {
              const stepNumber = idx + 1;
              const isCompleted = stepNumber <= currentStep;
              const isCurrent = stepNumber === currentStep;

              return (
                <div key={step.title} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                      isCompleted
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-slate-400">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carrier Details if available */}
        {shipment && (
          <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Carrier:</span>{' '}
              <strong className="text-slate-800">{shipment.carrier || 'Global Express'}</strong>
            </div>
            <div>
              <span className="text-slate-400">Tracking Number:</span>{' '}
              <strong className="text-blue-600">{shipment.trackingNumber || 'TRK-94820149'}</strong>
            </div>
            <div>
              <span className="text-slate-400">Estimated Delivery:</span>{' '}
              <strong className="text-slate-800">{formatDate(shipment.estimatedDeliveryDate)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Ordered Items & Summary Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Ordered Items Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Items in this Order ({order.items?.length || 0})
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Link
                    to={`/product/${item.productId}`}
                    className="font-bold text-slate-900 hover:text-blue-600 block text-sm"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-slate-500">
                    Unit Price: {formatCurrency(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Invoice Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Payment & Breakdown
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between text-slate-600">
                <span>Payment Method</span>
                <span className="font-semibold text-slate-800">
                  {order.paymentMethod || payment?.paymentMethod || 'Credit Card'}
                </span>
              </div>

              {payment && (
                <div className="flex justify-between text-slate-600">
                  <span>Payment Status</span>
                  <span className="font-semibold text-emerald-600">
                    {payment.status || 'Paid'}
                  </span>
                </div>
              )}

              {order.couponCode && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Applied</span>
                  <span className="font-bold">{order.couponCode}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Paid</span>
                <span className="text-2xl font-black text-blue-600">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-[11px] text-slate-500 mt-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official proof of purchase invoice generated for Customer #{order.customerId}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
