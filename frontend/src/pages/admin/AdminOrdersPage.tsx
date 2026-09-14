import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  X,
  MapPin,
  Calendar,
  CreditCard,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { OrderDetail } from '../../types/api.types';
import { Spinner } from '../../components/common/Spinner';

export const AdminOrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: adminApi.getAllOrders,
  });

  const getOrderStatus = (order: OrderDetail): string => {
    if (order.status) return String(order.status);
    if (order.orderStatus !== undefined && order.orderStatus !== null) {
      if (typeof order.orderStatus === 'string') return order.orderStatus;
      const map = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
      return map[order.orderStatus as number] || 'Pending';
    }
    return 'Pending';
  };

  const filteredOrders = orders.filter((o) => {
    const status = getOrderStatus(o);
    const matchesSearch =
      String(o.id).includes(searchTerm) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.couponCode && o.couponCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' ||
      status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Order Management</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review customer purchases, monitor payment status, and inspect immutable shipping records.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Order ID, Customer, Coupon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-slate-500">Loading order records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filter.'
                : 'No orders have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6">Payment Method</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      #{order.id}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {order.customerName || `Customer #${order.customerId}`}
                        </p>
                        <span className="text-[11px] text-slate-400">ID: {order.customerId}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(order.orderDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {formatCurrency(order.totalPrice ?? order.totalAmount ?? 0)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium capitalize bg-slate-100 px-2.5 py-1 rounded-lg">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {order.paymentMethod || 'Credit Card'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {(() => {
                        const statusText = getOrderStatus(order);
                        const isCompleted = statusText.toLowerCase() === 'completed' || statusText.toLowerCase() === 'delivered';
                        const isCancelled = statusText.toLowerCase() === 'cancelled';
                        return (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isCancelled
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {statusText}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Order Details #{selectedOrder.id}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Placed on {new Date(selectedOrder.orderDate).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Order Status & Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[11px] uppercase font-semibold text-slate-400">Customer</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedOrder.customerName || `Customer #${selectedOrder.customerId}`}
                  </p>
                  <p className="text-xs text-slate-500">Customer ID: {selectedOrder.customerId}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase font-semibold text-slate-400">Order Status</span>
                  <p className="mt-0.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      {getOrderStatus(selectedOrder)}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Payment: {selectedOrder.paymentMethod || 'Credit Card'}</p>
                </div>
              </div>

              {/* Immutable Shipping Address Snapshot */}
              <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Shipping Address Snapshot (Immutable)
                </div>
                {selectedOrder.shippingAddress ? (
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-900 text-sm">
                      {selectedOrder.shippingAddress.shippingRecipientName}
                    </p>
                    <p>Phone: {selectedOrder.shippingAddress.shippingPhone}</p>
                    <p>
                      {selectedOrder.shippingAddress.shippingStreet}
                      {selectedOrder.shippingAddress.shippingBuildingNumber &&
                        `, Bldg ${selectedOrder.shippingAddress.shippingBuildingNumber}`}
                    </p>
                    <p>
                      {selectedOrder.shippingAddress.shippingCity}
                      {selectedOrder.shippingAddress.shippingPostalCode &&
                        ` - ${selectedOrder.shippingAddress.shippingPostalCode}`}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No historical address snapshot attached to this order.
                  </p>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Purchased Items ({((selectedOrder.items || selectedOrder.orderItems) ?? []).length})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {((selectedOrder.items || selectedOrder.orderItems) ?? []).map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{item.productName}</p>
                          <p className="text-slate-400">Qty: {item.quantity} &times; {formatCurrency(item.unitPrice)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
                {selectedOrder.couponCode && (
                  <div className="flex items-center justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5" />
                      Coupon Applied ({selectedOrder.couponCode})
                    </span>
                    <span>Applied</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-base text-blue-600 font-extrabold">
                    {formatCurrency(selectedOrder.totalPrice ?? selectedOrder.totalAmount ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
