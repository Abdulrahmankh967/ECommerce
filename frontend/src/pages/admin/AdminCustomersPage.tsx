import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Trash2,
  Mail,
  Phone,
  Shield,
  UserCheck,
  ShoppingBag,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Customer } from '../../types/api.types';
import { Spinner } from '../../components/common/Spinner';

export const AdminCustomersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: adminApi.getAllCustomers,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      setDeletingCustomer(null);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Failed to delete customer.');
      setDeletingCustomer(null);
    },
  });

  const filteredCustomers = customers.filter((c) =>
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Accounts</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review registered customer profiles, contact info, roles, and order activity.
        </p>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
          {filteredCustomers.length} registered accounts
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-slate-500">Loading customer directory...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No customers found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search terms.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Account Role</th>
                  <th className="py-3.5 px-6">Orders Placed</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => {
                  const isAdmin = cust.role?.toLowerCase() === 'admin' || cust.role?.toLowerCase() === 'superadmin';
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                            {cust.fullName?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{cust.fullName}</p>
                            <span className="text-[11px] text-slate-400 font-mono">User ID: #{cust.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cust.email}</span>
                        </div>
                        {cust.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{cust.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isAdmin
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isAdmin ? (
                            <Shield className="w-3 h-3 text-purple-600" />
                          ) : (
                            <UserCheck className="w-3 h-3 text-blue-600" />
                          )}
                          {cust.role || 'Customer'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                          {cust.orders?.length ?? 0} orders
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setDeletingCustomer(cust)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete customer account"
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

      {/* Delete Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Account</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Are you sure you want to delete customer{' '}
              <span className="font-semibold text-slate-800">"{deletingCustomer.fullName}"</span>?
              This will remove their profile and login credentials.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingCustomer.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
              >
                {deleteMutation.isPending ? <Spinner size="sm" /> : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;
