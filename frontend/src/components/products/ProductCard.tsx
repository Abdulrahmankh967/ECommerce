import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Check, Star } from 'lucide-react';
import { Product } from '../../types/api.types';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';

export interface ProductCardProps {
  product: Product;
  discountPercent?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, discountPercent }) => {
  const { addToCart, isAddingToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItemId } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [addedRecently, setAddedRecently] = React.useState(false);

  const isFavorited = isInWishlist(product.id);

  // If discountPercent is provided (e.g. on Deals page), calculate original price
  const displayPrice = product.price;
  const originalPrice = discountPercent
    ? displayPrice / (1 - discountPercent / 100)
    : undefined;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await addToCart({ productId: product.id, quantity: 1 });
      setAddedRecently(true);
      setTimeout(() => setAddedRecently(false), 2000);
    } catch (error) {
      console.error('Failed to add item to cart', error);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        const itemId = getWishlistItemId(product.id);
        if (itemId) await removeFromWishlist(itemId);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error('Wishlist toggle error', error);
    }
  };

  // Fallback image if product image is empty
  const imageSource = product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop';

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 p-4 transition-all duration-300 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 flex flex-col justify-between">

      {/* Card Header: Badges & Wishlist */}
      <div>
        <div className="relative w-full aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3.5 flex items-center justify-center">
          <img
            src={imageSource}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {discountPercent && (
              <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-500 text-white rounded-md shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500 text-white rounded-md shadow-sm">
                Only {product.stock} left
              </span>
            )}
            {product.stock === 0 && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-700 text-white rounded-md shadow-sm">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${isFavorited
                ? 'bg-rose-50 text-rose-500 ring-1 ring-rose-200'
                : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
              }`}
            title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Category & Title */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
            {product.categoryName || 'Tech'}
          </span>
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Rating dummy display matching designs */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-xs font-semibold text-slate-700 ml-1">4.8</span>
          </div>
          <span className="text-[11px] text-slate-400">(42)</span>
        </div>
      </div>

      {/* Price & Add to Cart Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">

        {/* Price */}
        <div className="min-w-0">
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-slate-900 truncate">
              {formatCurrency(displayPrice)}
            </span>

            {originalPrice && (
              <span className="text-[11px] text-slate-400 line-through truncate">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAddingToCart}
          className={`shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${addedRecently
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none'
            }`}
        >
          {addedRecently ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
