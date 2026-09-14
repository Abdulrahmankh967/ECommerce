import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Supplier, CreateSupplierRequest } from '../../types/api.types';
import { Spinner } from '../../components/common/Spinner';

export const AdminSuppliersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [formError, setFormError] = useState<string>('');

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: adminApi.getAllSuppliers,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSupplierRequest) => adminApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      setIsCreateModalOpen(false);
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Failed to create supplier.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateSupplierRequest }) =>
      adminApi.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      setEditingSupplier(null);
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Failed to update supplier.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      setDeletingSupplier(null);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Failed to delete supplier.');
      setDeletingSupplier(null);
    },
  });

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Suppliers Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain manufacturing partners, wholesale vendors, and fulfillment contacts.
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
          Add New Supplier
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search suppliers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
          {filteredSuppliers.length} active vendors
        </span>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-slate-500">Loading supplier directory...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No suppliers found</h3>
            <p className="text-xs text-slate-400 mt-1">Register suppliers to track procurement.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Supplier</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Address</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{sup.name}</p>
                          <span className="text-[11px] text-slate-400 font-mono">ID: #{sup.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs space-y-1">
                      {sup.email && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sup.email}</span>
                        </div>
                      )}
                      {sup.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sup.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {sup.address ? (
                        <div className="flex items-center gap-1.5 max-w-xs truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{sup.address}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">No address on file</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          sup.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sup.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {sup.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setFormError('');
                            setEditingSupplier(sup);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit supplier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingSupplier(sup)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete supplier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Supplier Modal */}
      {(isCreateModalOpen || editingSupplier) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Add New Supplier'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingSupplier(null);
                }}
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
                const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
                const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim() || null;
                const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim() || null;
                const address = (form.elements.namedItem('address') as HTMLInputElement).value.trim() || null;
                const isActive = (form.elements.namedItem('isActive') as HTMLInputElement).checked;

                if (editingSupplier) {
                  updateMutation.mutate({
                    id: editingSupplier.id,
                    data: { name, email, phone, address, isActive },
                  });
                } else {
                  createMutation.mutate({ name, email, phone, address, isActive });
                }
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingSupplier?.name || ''}
                  placeholder="e.g. Apex Global Electronics"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingSupplier?.email || ''}
                    placeholder="contact@supplier.com"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingSupplier?.phone || ''}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Address</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={editingSupplier?.address || ''}
                  placeholder="123 Industrial Parkway, Suite 400"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editingSupplier ? editingSupplier.isActive : true}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">Supplier is actively supplying inventory</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingSupplier(null);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Spinner size="sm" />
                  ) : editingSupplier ? (
                    'Save Changes'
                  ) : (
                    'Register Supplier'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Supplier</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-slate-800">"{deletingSupplier.name}"</span> from
              the supplier directory?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingSupplier(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingSupplier.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
              >
                {deleteMutation.isPending ? <Spinner size="sm" /> : 'Delete Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuppliersPage;
