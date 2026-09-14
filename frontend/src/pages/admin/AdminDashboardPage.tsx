import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  Ticket,
  ArrowRight,
  Plus,
  Boxes,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { OrderDetail } from '../../types/api.types';
import { AdminStatCard } from '../../components/admin/AdminStatCard';
import { Spinner } from '../../components/common/Spinner';

export const AdminDashboardPage: React.FC = () => {
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: adminApi.getProducts,
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: adminApi.getAllOrders,
  });

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: adminApi.getAllCustomers,
  });

  const { data: coupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: adminApi.getAllCoupons,
  });

  const isLoading = loadingProducts || loadingOrders || loadingCustomers || loadingCoupons;

  // Aggregate metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice ?? o.totalAmount ?? 0), 0);
  const lowStockProducts = products.filter((p) => (p.stock ?? (p as any).quantity ?? (p as any).stockQuantity ?? 0) < 10);
  const activeCoupons = coupons.filter((c) => c.isActive);

  // Recent 5 orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5);

  const getOrderStatus = (order: OrderDetail): string => {
    if (order.status) return String(order.status);
    if (order.orderStatus !== undefined && order.orderStatus !== null) {
      if (typeof order.orderStatus === 'string') return order.orderStatus;
      const map = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
      return map[order.orderStatus as number] || 'Pending';
    }
    return 'Pending';
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading store metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20">
        <div className="space-y-1.5">
          <span className="text-xs uppercase font-bold tracking-widest text-blue-400">Store Performance</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-slate-300 max-w-xl">
            Quick overview of sales transactions, recent activity, and stock status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <AdminStatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="emerald"
          subtitle="Overall lifetime sales"
        />

        <AdminStatCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingCart}
          color="blue"
          subtitle="Processed transactions"
          link="/admin/orders"
        />

        <AdminStatCard
          title="Catalog Items"
          value={products.length}
          icon={Package}
          color="indigo"
          subtitle="Active store items"
          link="/admin/products"
        />

        <AdminStatCard
          title="Customers"
          value={customers.length}
          icon={Users}
          color="violet"
          subtitle="Registered accounts"
          link="/admin/customers"
        />

        <AdminStatCard
          title="Low Stock Alert"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          color="rose"
          subtitle={lowStockProducts.length > 0 ? 'Action required' : 'Stock optimal'}
          link="/admin/inventory"
        />

        <AdminStatCard
          title="Active Coupons"
          value={activeCoupons.length}
          icon={Ticket}
          color="amber"
          subtitle="Running promotions"
          link="/admin/coupons"
        />
      </div>

      {/* Main Sections: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders (2 Columns on XL) */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest transactions placed on the storefront</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
            >
              All Orders
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">
                No customer orders recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-6">Order ID</th>
                    <th className="py-3 px-6">Customer</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        #{order.id}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">
                        {order.customerName || `Customer #${order.customerId}`}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {new Date(order.orderDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {formatCurrency(order.totalPrice ?? order.totalAmount ?? 0)}
                      </td>
                      <td className="py-4 px-6">
                        {(() => {
                          const statusText = getOrderStatus(order);
                          const isCompleted = statusText.toLowerCase() === 'completed' || statusText.toLowerCase() === 'delivered';
                          const isCancelled = statusText.toLowerCase() === 'cancelled';
                          return (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : isCancelled
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
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
                        <Link
                          to="/admin/orders"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 inline-flex transition-colors"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 text-center">
            Displaying the 5 most recent store transactions.
          </div>
        </div>

        {/* Low Stock Warning Sidebar (1 Column on XL) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Stock Alerts</h3>
                  <p className="text-xs text-slate-500">Products with stock under 10</p>
                </div>
              </div>
              <Link
                to="/admin/inventory"
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Manage
              </Link>
            </div>

            <div className="p-4 divide-y divide-slate-100">
              {lowStockProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All products have healthy inventory!
                </div>
              ) : (
                lowStockProducts.slice(0, 6).map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400 truncate">{item.categoryName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${item.stock === 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {item.stock} left
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Link
              to="/admin/inventory"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Boxes className="w-4 h-4" />
              Open Inventory Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;