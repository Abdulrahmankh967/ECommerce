import React from 'react';
import { Category } from '../../types/api.types';
import { Filter, RotateCcw } from 'lucide-react';

export interface FilterState {
  categoryId: number | null;
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
}

export interface ProductFiltersProps {
  categories: Category[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Categories</h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <label className="flex items-center justify-between text-sm py-1 cursor-pointer hover:text-blue-600">
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="category"
                checked={filters.categoryId === null}
                onChange={() => onFilterChange({ ...filters, categoryId: null })}
                className="rounded-full text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300"
              />
              <span className={filters.categoryId === null ? 'font-semibold text-blue-600' : 'text-slate-700'}>
                All Categories
              </span>
            </div>
          </label>

          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center justify-between text-sm py-1 cursor-pointer hover:text-blue-600"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="category"
                  checked={filters.categoryId === cat.id}
                  onChange={() => onFilterChange({ ...filters, categoryId: cat.id })}
                  className="rounded-full text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300"
                />
                <span className={filters.categoryId === cat.id ? 'font-semibold text-blue-600' : 'text-slate-700'}>
                  {cat.name}
                </span>
              </div>
              {cat.productCount > 0 && (
                <span className="text-xs text-slate-400">({cat.productCount})</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Range</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 font-medium">Min ($)</label>
            <input
              type="number"
              min={0}
              value={filters.minPrice || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, minPrice: Number(e.target.value) || 0 })
              }
              placeholder="0"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-medium">Max ($)</label>
            <input
              type="number"
              min={0}
              value={filters.maxPrice || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, maxPrice: Number(e.target.value) || 0 })
              }
              placeholder="2000"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* In-Stock Filter */}
      <div className="pt-4 border-t border-slate-100">
        <label className="flex items-center gap-2.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked })}
            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300"
          />
          <span className="text-slate-700 font-medium">In Stock Only</span>
        </label>
      </div>
    </div>
  );
};
