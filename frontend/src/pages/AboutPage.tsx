import React from 'react';
import { ShieldCheck, HeartHandshake, Zap, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section matching Screenshot Image 2, Frame 5 */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">
                The ShopNest Story
              </span>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                More Than Just an <span className="text-blue-400">Online Store</span>
              </h1>
              <p className="text-base text-slate-300 max-w-lg leading-relaxed mx-auto lg:mx-0">
                Founded with an obsession for engineering excellence and genuine consumer trust, ShopNest empowers everyday professionals, creators, and enthusiasts with authentic electronics and transparent service.
              </p>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop"
                  alt="ShopNest Team Workspace"
                  className="w-full h-80 lg:h-96 object-cover object-center"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-blue-600">100K+</h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">Happy Shoppers</p>
            <p className="text-[11px] text-slate-400">Delivered with 5-star ratings</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-blue-600">500+</h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">Direct Brands</p>
            <p className="text-[11px] text-slate-400">Manufacturer warranties</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-blue-600">99.9%</h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">On-Time Delivery</p>
            <p className="text-[11px] text-slate-400">Expedited logistics networks</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black text-blue-600">24/7</h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">Specialist Support</p>
            <p className="text-[11px] text-slate-400">Direct technical help</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Guiding Principles</span>
          <h2 className="text-3xl font-extrabold text-slate-900">Our Core Commitments</h2>
          <p className="text-sm text-slate-500">Every decision we make starts with your technological security and satisfaction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero Compromise Quality</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We verify and test every product before adding it to our warehouse. No counterfeit or unauthorized items ever.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">High Speed Logistics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time stock reservation and rapid automated fulfillment ensures your order ships within hours.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Fair Transparent Pricing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transparent discount codes, honest shipping rates, and price protection guarantees for buyers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Community Driven</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We listen to real customer reviews, continuous feedback, and feature requests to elevate your shopping experience.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
