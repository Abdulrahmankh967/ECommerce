import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { useCart } from '../../src/hooks/useCart';
import { useWishlist } from '../../src/hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, formatDate } from '../utils/formatters';
import { RatingStars } from '../components/common/RatingStars';
import { Spinner } from '../components/common/Spinner';
import { Button } from '../components/common/Button';
import { ProductCard } from '../components/products/ProductCard';
import { 
  ShoppingCart, 
  Heart, 
  Check, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ChevronRight, 
  Trash2,
  Send,
  MessageSquarePlus
} from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { addToCart, isAddingToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItemId } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [addedRecently, setAddedRecently] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Fetch product details
  const { data: product, isLoading: isProductLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getProductById(productId),
    enabled: !isNaN(productId) && productId > 0,
  });

  // Fetch product reviews
  const { data: reviews = [], isLoading: isReviewsLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => productsApi.getReviewsByProduct(productId),
    enabled: !isNaN(productId) && productId > 0,
  });

  // Fetch related products in same category
  const { data: categoryProducts = [] } = useQuery({
    queryKey: ['products-category', product?.categoryId],
    queryFn: () => productsApi.getProductsByCategory(product!.categoryId),
    enabled: !!product?.categoryId,
  });

  const relatedProducts = categoryProducts
    .filter((p) => p.id !== productId)
    .slice(0, 4);

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: productsApi.addReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setReviewComment('');
      setReviewRating(5);
      setReviewError('');
    },
    onError: (err: any) => {
      setReviewError(err?.response?.data?.message || 'Failed to submit review');
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: productsApi.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });

  if (isProductLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-500 mb-6">The item you are looking for does not exist or has been discontinued.</p>
        <Link to="/shop" className="text-blue-600 font-semibold hover:underline">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await addToCart({ productId: product.id, quantity });
      setAddedRecently(true);
      setTimeout(() => setAddedRecently(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart', error);
    }
  };

  const handleToggleWishlist = async () => {
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
      console.error('Wishlist error', error);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setReviewError('');
    addReviewMutation.mutate({
      productId: product.id,
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
    });
  };

  // Compute average rating from real reviews
  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 4.8;

  const imageSource = product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-blue-600">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?category=${product.categoryId}`} className="hover:text-blue-600">
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left: Product Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-slate-200/80 p-6 flex items-center justify-center shadow-sm">
            <img
              src={imageSource}
              alt={product.name}
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500"
            />
            {product.stock <= 5 && product.stock > 0 && (
              <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-bold bg-amber-500 text-white rounded-lg shadow-sm">
                Only {product.stock} left in stock
              </span>
            )}
            {product.stock === 0 && (
              <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-bold bg-slate-800 text-white rounded-lg shadow-sm">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Details, Price & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {product.categoryName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>
            
            {/* Rating & Reviews counter */}
            <div className="flex items-center gap-3 pt-1">
              <RatingStars rating={avgRating} size="md" />
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                {reviews.length} {reviews.length === 1 ? 'Customer Review' : 'Customer Reviews'}
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              {formatCurrency(product.price)}
            </span>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              In Stock & Ready to Ship
            </span>
          </div>

          {/* Description snippet */}
          <p className="text-sm text-slate-600 leading-relaxed">
            Crafted for high performance and daily reliability. Verified for authentic specifications, precision components, and full compatibility.
          </p>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold text-slate-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                  disabled={quantity >= product.stock}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                isLoading={isAddingToCart}
                className="flex-1 py-3.5 rounded-xl shadow-lg shadow-blue-600/20"
                variant={addedRecently ? 'secondary' : 'primary'}
                leftIcon={addedRecently ? <Check className="w-5 h-5 text-emerald-600" /> : <ShoppingCart className="w-5 h-5" />}
              >
                {addedRecently ? 'Added to Cart!' : 'Add to Shopping Cart'}
              </Button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-xl border transition-all ${
                  isFavorited
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-slate-300 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-300'
                }`}
                title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200/80">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Free Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>2-Year Warranty</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
              <span>30-Day Returns</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Tab Headers */}
        <div className="flex items-center gap-6 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('description')}
            className={`text-sm font-bold pb-2 transition-all relative ${
              activeTab === 'description'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`text-sm font-bold pb-2 transition-all relative ${
              activeTab === 'specs'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-sm font-bold pb-2 transition-all relative ${
              activeTab === 'reviews'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'description' && (
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed max-w-3xl">
            <p>
              The {product.name} represents high-standard engineering within the {product.categoryName} space.
              Engineered with premium materials for durability, this product guarantees seamless day-to-day usability.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Comprehensive quality inspection passed with factory test certificate.</li>
              <li>Engineered for high energy efficiency and prolonged operational life.</li>
              <li>Full compatibility with current operating systems and standard accessories.</li>
              <li>Includes manufacturer-authorized technical support and prompt warranty assistance.</li>
            </ul>
          </div>
        )}

        {/* Tab 2: Specs */}
        {activeTab === 'specs' && (
          <div className="max-w-xl text-sm">
            <dl className="divide-y divide-slate-100">
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500 font-medium">Model</dt>
                <dd className="font-semibold text-slate-800">{product.name}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500 font-medium">Category</dt>
                <dd className="font-semibold text-slate-800">{product.categoryName}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500 font-medium">In Stock Status</dt>
                <dd className="font-semibold text-emerald-600">{product.stock} units available</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500 font-medium">Warranty</dt>
                <dd className="font-semibold text-slate-800">2 Years Manufacturer Standard</dd>
              </div>
            </dl>
          </div>
        )}

        {/* Tab 3: Reviews with real API integration */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            
            {/* Review Submission Form */}
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquarePlus className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-900">Write a Review</h4>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Rating</label>
                  <RatingStars
                    rating={reviewRating}
                    interactive
                    size="lg"
                    onRate={(val) => setReviewRating(val)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Comment (Optional)</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {reviewError && (
                  <p className="text-xs text-rose-600 font-medium">{reviewError}</p>
                )}

                <Button
                  type="submit"
                  size="sm"
                  isLoading={addReviewMutation.isPending}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Submit Review
                </Button>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs">
                <span className="text-blue-900">Have you purchased this product? Sign in to submit your rating and review.</span>
                <Link to="/login" className="font-bold text-blue-700 hover:underline">
                  Sign In
                </Link>
              </div>
            )}

            {/* Existing Reviews List */}
            {isReviewsLoading ? (
              <Spinner />
            ) : reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No reviews yet for this product. Be the first to review it!</p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {rev.customerName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{rev.customerName}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</span>
                      </div>

                      {/* Allow delete if current user owns the review or is admin */}
                      {user && (user.id === rev.customerId || user.role?.toLowerCase() === 'admin') && (
                        <button
                          type="button"
                          onClick={() => deleteReviewMutation.mutate(rev.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <RatingStars rating={rev.rating} size="sm" />

                    {rev.comment && (
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <h3 className="text-xl font-bold text-slate-900">Related Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
