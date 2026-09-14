import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Truck
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#0B132B] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* Top Value Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Free Express Shipping</h4>
              <p className="text-xs text-slate-400">On all orders over $99.00 worldwide</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">2-Year Official Warranty</h4>
              <p className="text-xs text-slate-400">Genuine items direct from manufacturers</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Secure Payment Gateway</h4>
              <p className="text-xs text-slate-400">256-bit encrypted transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Company Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Shop<span className="text-blue-500">Nest</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Your premium destination for authentic electronics, cutting-edge laptops, high-fidelity audio, and modern smart home gadgets.
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>11, Al Yassmen</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+962 0780361967</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>khlifatabood19@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Shop</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/deals" className="hover:text-white transition-colors">Deals & Offers</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Category Catalog</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">My Cart</Link></li>
              <li><Link to="/account?tab=wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Customer Care</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/account?tab=orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><a href="#shipping" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#warranty" className="hover:text-white transition-colors">Warranty Policy</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy & Terms</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Stay Connected</h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Subscribe to get special discounts, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Thank you for subscribing!</span>
                </div>
              )}
            </form>
          </div>

        </div>
      </div>

      {/* Bottom Copyright & Payment Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} ShopNest Inc. All rights reserved.</p>

        {/* Payment Icons */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] font-semibold text-slate-200">VISA</span>
          <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] font-semibold text-slate-200">MASTERCARD</span>
          <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] font-semibold text-slate-200">PAYPAL</span>
          <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] font-semibold text-slate-200">APPLE PAY</span>
        </div>
      </div>
    </footer>
  );
};
