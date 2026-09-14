import React from 'react';
import { Product } from '../../types/api.types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../common/EmptyState';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  discountMap?: Record<number, number>; // productId -> discount %
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your search or filter criteria to discover more products.',
  discountMap,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse space-y-4"
          >
            <div className="w-full aspect-square bg-slate-100 rounded-xl" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded w-1/4" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="h-8 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="my-8">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          discountPercent={discountMap ? discountMap[product.id] : undefined}
        />
      ))}
    </div>
  );
};
