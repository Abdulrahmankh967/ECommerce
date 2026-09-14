import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard,
  Search,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { OrderDetail } from '../../types/api.types';
import { Spinner } from '../../components/common/Spinner';

export const AdminPaymentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Orders represent financial transactions in this store
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: adminApi.getAllOrders,
  });

  const totalCaptured = orders.reduce((sum, o) => sum + (o.totalPrice ?? o.totalAmount ?? 0), 0);
  const avgOrderValue = orders.length > 0 ? totalCaptured / orders.length : 0;

  const filteredOrders = orders.filter((o) =>
    String(o.id).includes(searchTerm) ||
    (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (o.paymentMethod && o.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Payments & Transactions</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Audit customer payment settlements, capture methods, and financial ledger items.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Processed</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {formatCurrency(totalCaptured)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Total transaction volume</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Order Value</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              {formatCurrency(avgOrderValue)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Per settlement transaction</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transactions Count</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{orders.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Lifetime settled orders</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Order ID or Payment Method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
          {filteredOrders.length} transaction records
        </span>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-slate-500">Retrieving financial ledger...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No payment records found</h3>
            <p className="text-xs text-slate-400 mt-1">Transactions are recorded once orders are processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Order Reference</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Payment Method</th>
                  <th className="py-3.5 px-6">Transaction Date</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6 text-right">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      #{order.id}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">
                        {order.customerName || `Customer #${order.customerId}`}
                      </p>
                      <span className="text-[11px] text-slate-400">Account ID: #{order.customerId}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                        {order.paymentMethod || 'Credit Card'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(order.orderDate).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600">
                      {formatCurrency(order.totalPrice ?? order.totalAmount ?? 0)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
