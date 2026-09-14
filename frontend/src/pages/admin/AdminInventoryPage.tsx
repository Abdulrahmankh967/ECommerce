import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  DollarSign,
  Edit3,
  X,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import { Product, UpdateProductRequest } from '../../types/api.types';
import { Spinner } from '../../components/common/Spinner';

export const AdminInventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [editingStockProduct, setEditingStockProduct] = useState<Product | null>(null);
  const [newStockInput, setNewStockInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const { data: rawProductsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: adminApi.getProducts,
  });

  // 🛠️ حل مشكلة التغليف (Unwrap API Response if it's Paginated)
  const products: Product[] = React.useMemo(() => {
    if (!rawProductsData) return [];
    if (Array.isArray(rawProductsData)) return rawProductsData;

    const data = rawProductsData as any;
    return data.items || data.data || data.products || [];
  }, [rawProductsData]);

  // هيلبر صغيّر لجلب كمية المخزون بغض النظر عن مسمى الحقل القادم من الباك إند
  const getStock = (p: any): number => {
    return p.stock ?? p.quantity ?? p.stockQuantity ?? p.unitsInStock ?? 0;
  };

  const updateStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) =>
      adminApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setEditingStockProduct(null);
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Failed to update product stock.');
    },
  });

  // Aggregates (مع دعم جميع مسميات الفيلدز)
  const totalStockUnits = products.reduce((sum, p) => sum + getStock(p), 0);
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + getStock(p) * (p.price || 0),
    0
  );
  const lowStockCount = products.filter((p) => getStock(p) > 0 && getStock(p) < 10).length;
  const outOfStockCount = products.filter((p) => getStock(p) === 0).length;

  const filteredProducts = products.filter((p) => {
    const name = p.name || '';
    const category = p.categoryName || (p as any).category?.name || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase());

    const currentStock = getStock(p);
    let matchesFilter = true;
    if (stockFilter === 'out') matchesFilter = currentStock === 0;
    else if (stockFilter === 'low') matchesFilter = currentStock > 0 && currentStock < 10;
    else if (stockFilter === 'healthy') matchesFilter = currentStock >= 10;

    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory & Stock Control</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor warehouse quantities, restock low thresholds, and calculate aggregate inventory valuation.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Units</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalStockUnits} pcs</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Across all catalog SKUs</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Value</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {formatCurrency(totalInventoryValue)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Retail inventory value</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock SKUs</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{lowStockCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Fewer than 10 units left</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Out of Stock</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{outOfStockCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Zero availability</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search items or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'low', 'out', 'healthy'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setStockFilter(filterType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${stockFilter === filterType
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {filterType === 'all'
                ? `All (${products.length})`
                : filterType === 'low'
                  ? `Low Stock (${lowStockCount})`
                  : filterType === 'out'
                    ? `Out of Stock (${outOfStockCount})`
                    : 'Healthy (10+)'}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table & Dynamic Empty States */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-slate-500">Checking inventory levels...</p>
          </div>
        ) : products.length === 0 ? (
          /* حالة عدم وجود أي منتجات في النظام مطلقاً */
          <div className="py-20 text-center">
            <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No products found in catalog</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Start by creating products to manage your inventory.</p>
            <RouterLink
              to="/admin/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-500 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Go to Products Management
            </RouterLink>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* حالة الفلتر لم يطابق نتائج */
          <div className="py-20 text-center">
            <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No items match criteria</h3>
            <p className="text-xs text-slate-400 mt-1">Try switching the inventory filter or clear your search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Unit Price</th>
                  <th className="py-3.5 px-6">Current Stock</th>
                  <th className="py-3.5 px-6">Stock Status</th>
                  <th className="py-3.5 px-6">Total Value</th>
                  <th className="py-3.5 px-6 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((item) => {
                  const itemStock = getStock(item);
                  const isOut = itemStock === 0;
                  const isLow = itemStock > 0 && itemStock < 10;
                  const categoryName = item.categoryName || (item as any).category?.name || 'Uncategorized';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {categoryName}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {itemStock}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                        >
                          {isOut ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : isLow ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Adequate'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {formatCurrency(itemStock * (item.price || 0))}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setErrorMsg('');
                            setEditingStockProduct(item);
                            setNewStockInput(String(itemStock));
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Adjust Stock
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

      {/* Adjust Stock Level Modal */}
      {editingStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Adjust Stock Level</h3>
              <button
                onClick={() => setEditingStockProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-xs text-slate-400 font-medium">Product</span>
                <p className="text-sm font-semibold text-slate-900">{editingStockProduct.name}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Quantity in Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockInput}
                  onChange={(e) => setNewStockInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingStockProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const qty = parseInt(newStockInput, 10);
                  if (isNaN(qty) || qty < 0) return;
                  updateStockMutation.mutate({
                    id: editingStockProduct.id,
                    data: {
                      name: editingStockProduct.name,
                      price: editingStockProduct.price,
                      stock: qty,
                      categoryId: editingStockProduct.categoryId,
                      imageUrl: editingStockProduct.imageUrl,
                      isActive: editingStockProduct.isActive,
                    },
                  });
                }}
                disabled={updateStockMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                {updateStockMutation.isPending ? <Spinner size="sm" /> : 'Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;