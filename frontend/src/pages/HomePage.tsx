import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { ProductGrid } from '../components/products/ProductGrid';
import { 
  ArrowRight, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  Headphones, 
  Laptop, 
  Smartphone, 
  Watch, 
  Tv, 
  Camera, 
  Gamepad2, 
  Layers 
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAllProducts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getAllCategories,
  });

  // Featured products: active products
  const featuredProducts = products.filter((p) => p.isActive).slice(0, 8);

  const categoryIcons: Record<string, React.ReactNode> = {
    'Laptops': <Laptop className="w-5 h-5" />,
    'Audio': <Headphones className="w-5 h-5" />,
    'Smartphones': <Smartphone className="w-5 h-5" />,
    'Wearables': <Watch className="w-5 h-5" />,
    'Gaming': <Gamepad2 className="w-5 h-5" />,
    'Cameras': <Camera className="w-5 h-5" />,
    'Televisions': <Tv className="w-5 h-5" />,
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Next-Gen Electronics & Audio</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Better Products for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Brighter You</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Discover flagship smartphones, high-fidelity sound, and professional gear backed by genuine manufacturer warranty and express shipping.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/shop"
                  className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/deals"
                  className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition-all backdrop-blur-sm"
                >
                  Explore Deals
                </Link>
              </div>

              {/* Value Highlights Under Hero */}
              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <h4 className="text-lg font-bold text-white">100%</h4>
                  <p className="text-xs text-slate-400">Authentic Gear</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Free</h4>
                  <p className="text-xs text-slate-400">Fast Shipping</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">24/7</h4>
                  <p className="text-xs text-slate-400">Live Support</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Image Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-3xl opacity-20 blur-2xl animate-pulse" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                    alt="Premium Noise-Cancelling Headphones"
                    className="w-full h-80 lg:h-[420px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">Featured Flagship</span>
                      <h4 className="text-sm font-semibold text-white">Studio Pro Wireless Headphones</h4>
                    </div>
                    <span className="text-sm font-bold text-cyan-400">$349.00</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Feature Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complimentary Shipping</h3>
              <p className="text-xs text-slate-500">Free delivery on eligible orders</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Official Protection</h3>
              <p className="text-xs text-slate-500">100% genuine guaranteed devices</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Expert Support</h3>
              <p className="text-xs text-slate-500">Dedicated specialists 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category (Interactive Circles) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Shop by Category</h2>
            <p className="text-xs sm:text-sm text-slate-500">Browse through our wide selection of certified hardware</p>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
          {categories.slice(0, 7).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all text-center"
            >
              <div className="w-14 h-14 rounded-full bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                {categoryIcons[cat.name] || <Layers className="w-5 h-5" />}
              </div>
              <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-full">
                {cat.name}
              </h4>
              <span className="text-[10px] text-slate-400 mt-0.5">Explore</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
            <p className="text-xs sm:text-sm text-slate-500">Top-tier tech loved by tech enthusiasts worldwide</p>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>See Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} isLoading={isProductsLoading} />
      </section>

      {/* 5. Promotional Split Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-10 flex flex-col justify-between shadow-xl">
            <div className="relative z-10 space-y-3 max-w-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Audio Experience</span>
              <h3 className="text-2xl font-extrabold text-white leading-snug">
                Immersive Noise Cancellation
              </h3>
              <p className="text-xs text-slate-300">
                Experience crystal-clear acoustic clarity and 40-hour battery life.
              </p>
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                >
                  Shop Headsets <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-60 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop"
                alt="Headphones Promo"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-8 md:p-10 flex flex-col justify-between shadow-xl">
            <div className="relative z-10 space-y-3 max-w-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Workspace Setup</span>
              <h3 className="text-2xl font-extrabold text-white leading-snug">
                Elevate Your Productivity
              </h3>
              <p className="text-xs text-blue-100">
                Ultrawide 4K monitors and mechanical keyboards engineered for precision.
              </p>
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200"
                >
                  Discover Workstations <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-60 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop"
                alt="Monitor Promo"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
