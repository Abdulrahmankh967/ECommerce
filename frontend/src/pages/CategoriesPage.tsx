import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { ArrowRight, Layers } from 'lucide-react';
import { Spinner } from '../components/common/Spinner';

// High resolution contextual photos mapped to categories
const categoryPhotos: Record<string, string> = {
  'Electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop',
  'Smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop',
  'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop',
  'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop',
  'Wearables': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
  'Home Appliances': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop',
  'Gaming': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop',
  'Cameras': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop',
  'Computers & Accessories': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop',
  'Networking': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop',
  'Tablets': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop',
  'Televisions': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop',
  'Smart Home': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop',
  'Office Electronics': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop',
  'Storage Devices': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop',
  'Monitors': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop',
  'Printers & Scanners': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop',
  'Drones': 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop',
  'Personal Care': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop',
};

export const CategoriesPage: React.FC = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getAllCategories,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          Product Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Shop by Category
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Navigate through our meticulously organized collections. Everything is tested and verified for performance and longevity.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const photo =
              categoryPhotos[category.name] ||
              'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop';

            return (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="group relative rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                {/* Image Showcase */}
                <div className="relative w-full h-48 overflow-hidden bg-slate-100">
                  <img
                    src={photo}
                    alt={category.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                      Collection
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="p-4 bg-white flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold text-slate-500">
                    {category.productCount > 0
                      ? `${category.productCount} Products`
                      : 'Explore Gear'}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
};
