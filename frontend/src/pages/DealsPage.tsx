import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { ProductGrid } from '../components/products/ProductGrid';
import { Flame, Filter, Tag, RotateCcw } from 'lucide-react';

export const DealsPage: React.FC = () => {
  const { data: allProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAllProducts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getAllCategories,
  });

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDiscountRange, setSelectedDiscountRange] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(0);

  // Deterministically assign deals & discounts to products (e.g., based on product ID)
  // This produces realistic promotional percentages matching the screenshots (-15%, -20%, -25%, -30%, -40%, -50%)
  const discountPercentages = [15, 20, 25, 30, 40, 50];

  const productDeals = useMemo(() => {
    const map: Record<number, number> = {};
    allProducts.forEach((p, idx) => {
      // 80% of items are marked down on the deals page
      map[p.id] = discountPercentages[idx % discountPercentages.length];
    });
    return map;
  }, [allProducts]);

  const filteredDeals = useMemo(() => {
    return allProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== null && product.categoryId !== selectedCategory) {
        return false;
      }

      // Discount Range filter
      const discount = productDeals[product.id] || 0;
      if (selectedDiscountRange === '10-20' && (discount < 10 || discount > 20)) return false;
      if (selectedDiscountRange === '20-30' && (discount < 20 || discount > 30)) return false;
      if (selectedDiscountRange === '30-50' && (discount < 30 || discount > 50)) return false;
      if (selectedDiscountRange === '50+' && discount < 50) return false;

      // Price filter
      if (maxPrice > 0 && product.price > maxPrice) {
        return false;
      }

      return true;
    });
  }, [allProducts, selectedCategory, selectedDiscountRange, maxPrice, productDeals]);

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedDiscountRange(null);
    setMaxPrice(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Deals Hero Banner matching Screenshot Image 1, Frame 1 */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Limited Time Special Event</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Best Deals, Bigger Savings
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg leading-relaxed">
            Upgrade your devices with special markdown pricing. Take advantage of manufacturer rebates and exclusive seasonal discounts.
          </p>
        </div>

        {/* Floating badge */}
        <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-4 flex flex-col items-center justify-center text-center shadow-2xl rotate-6 hover:rotate-0 transition-transform">
              <span className="text-[11px] font-bold text-blue-200 uppercase">Up to</span>
              <span className="text-3xl font-black text-cyan-300">50%</span>
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">OFF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Deals Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Deals Filter</span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Discount Range */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Discount Range
            </h4>
            <div className="space-y-2 text-sm">
              {[
                { label: 'All Discounts', value: null },
                { label: '10% - 20% Off', value: '10-20' },
                { label: '20% - 30% Off', value: '20-30' },
                { label: '30% - 50% Off', value: '30-50' },
                { label: '50% & Above', value: '50+' },
              ].map((range) => (
                <label
                  key={range.label}
                  className="flex items-center gap-2.5 cursor-pointer hover:text-blue-600"
                >
                  <input
                    type="radio"
                    name="discountRange"
                    checked={selectedDiscountRange === range.value}
                    onChange={() => setSelectedDiscountRange(range.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={selectedDiscountRange === range.value ? 'font-semibold text-blue-600' : 'text-slate-700'}>
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Category
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-sm">
              <label className="flex items-center gap-2.5 cursor-pointer py-0.5 hover:text-blue-600">
                <input
                  type="radio"
                  name="dealCategory"
                  checked={selectedCategory === null}
                  onChange={() => setSelectedCategory(null)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className={selectedCategory === null ? 'font-semibold text-blue-600' : 'text-slate-700'}>
                  All Categories
                </span>
              </label>
              {categories.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2.5 cursor-pointer py-0.5 hover:text-blue-600"
                >
                  <input
                    type="radio"
                    name="dealCategory"
                    checked={selectedCategory === c.id}
                    onChange={() => setSelectedCategory(c.id)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={selectedCategory === c.id ? 'font-semibold text-blue-600' : 'text-slate-700'}>
                    {c.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Max Price ($)
            </h4>
            <input
              type="number"
              min={0}
              value={maxPrice || ''}
              onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
              placeholder="e.g. 500"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Product Deals Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-500" />
              <h2 className="text-lg font-bold text-slate-900">
                Deals & Offers ({filteredDeals.length})
              </h2>
            </div>
          </div>

          <ProductGrid
            products={filteredDeals}
            isLoading={isProductsLoading}
            discountMap={productDeals}
            emptyTitle="No promotional offers match this filter"
            emptyDescription="Try selecting a different discount range or category."
          />
        </div>

      </div>

    </div>
  );
};
