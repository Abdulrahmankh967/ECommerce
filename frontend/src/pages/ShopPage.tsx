import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { ProductGrid } from '../components/products/ProductGrid';
import { ProductFilters, FilterState } from '../components/products/ProductFilters';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc'>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    categoryId: categoryParam ? Number(categoryParam) : null,
    minPrice: 0,
    maxPrice: 0,
    inStockOnly: false,
  });

  // Sync categoryParam from URL if changed
  useEffect(() => {
    if (categoryParam) {
      setFilters((prev) => ({ ...prev, categoryId: Number(categoryParam) }));
    }
  }, [categoryParam]);

  useEffect(() => {
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
  }, [searchParam]);

  const { data: allProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAllProducts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getAllCategories,
  });

  // Apply filters, search, and sort
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Category filter
      if (filters.categoryId !== null && product.categoryId !== filters.categoryId) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCategory = product.categoryName?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory) return false;
      }

      // Price filter
      if (filters.minPrice > 0 && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice > 0 && product.price > filters.maxPrice) {
        return false;
      }

      // Stock filter
      if (filters.inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    });
  }, [allProducts, filters, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const handleResetFilters = () => {
    setFilters({
      categoryId: null,
      minPrice: 0,
      maxPrice: 0,
      inStockOnly: false,
    });
    setSearchQuery('');
    setSearchParams({});
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Official Catalog</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            All Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Explore our curated inventory of verified premium devices, computers, audio equipment, and wearable electronics.
          </p>
        </div>
      </div>

      {/* Main Layout: Sidebar & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Left Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 sticky top-28">
          <ProductFilters
            categories={categories}
            filters={filters}
            onFilterChange={(newFilters) => {
              setFilters(newFilters);
              setCurrentPage(1);
            }}
            onReset={handleResetFilters}
          />
        </div>

        {/* Right Side: Search, Controls, Grid & Pagination */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="w-full sm:w-72 relative">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="shop-sort" className="text-xs text-slate-500 font-medium shrink-0">Sort By:</label>
                <select
                  id="shop-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

          </div>

          {/* Mobile Filter Drawer */}
          {isMobileFiltersOpen && (
            <div className="lg:hidden">
              <ProductFilters
                categories={categories}
                filters={filters}
                onFilterChange={(newFilters) => {
                  setFilters(newFilters);
                  setCurrentPage(1);
                }}
                onReset={handleResetFilters}
              />
            </div>
          )}

          {/* Results Counter */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800">{paginatedProducts.length}</strong> of{' '}
              <strong className="text-slate-800">{sortedProducts.length}</strong> products
            </span>
            {filters.categoryId && (
              <span className="text-blue-600 font-medium">
                Category: {categories.find((c) => c.id === filters.categoryId)?.name}
              </span>
            )}
          </div>

          {/* Product Grid */}
          <ProductGrid products={paginatedProducts} isLoading={isProductsLoading} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
