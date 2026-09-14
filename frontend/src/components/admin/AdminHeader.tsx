import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Store,
  ChevronRight,
  LogOut,
  User,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
}

const routeTitles: Record<string, { title: string; category: string }> = {
  '/admin': { title: 'Dashboard', category: 'Overview' },
  '/admin/dashboard': { title: 'Dashboard Overview', category: 'Overview' },
  '/admin/products': { title: 'Products Catalog', category: 'Catalog & Stock' },
  '/admin/categories': { title: 'Category Management', category: 'Catalog & Stock' },
  '/admin/inventory': { title: 'Inventory & Stock Control', category: 'Catalog & Stock' },
  '/admin/orders': { title: 'Orders Management', category: 'Sales & Logistics' },
  '/admin/shipments': { title: 'Shipments & Tracking', category: 'Sales & Logistics' },
  '/admin/payments': { title: 'Payments & Transactions', category: 'Sales & Logistics' },
  '/admin/coupons': { title: 'Discounts & Coupons', category: 'Sales & Logistics' },
  '/admin/customers': { title: 'Customer Accounts', category: 'Relations' },
  '/admin/suppliers': { title: 'Supplier Directory', category: 'Relations' },
  '/admin/reviews': { title: 'Customer Reviews Moderation', category: 'Relations' },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const currentRouteInfo = routeTitles[location.pathname] || {
    title: 'Admin Control Center',
    category: 'Admin',
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      {/* Left side: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span className="text-slate-700">{currentRouteInfo.category}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {currentRouteInfo.title}
          </h1>
        </div>
      </div>

      {/* Right side: Quick Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Live environment badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Online</span>
        </div>

        {/* View Storefront */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 border border-slate-200 transition-all shadow-sm"
          title="Open live storefront in new tab"
        >
          <Store className="w-4 h-4 text-blue-500" />
          <span>Live Store</span>
        </Link>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {user?.fullName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 max-w-[120px] truncate leading-tight">
                {user?.fullName || 'Admin User'}
              </p>
              <p className="text-[10px] text-blue-600 font-medium capitalize">
                {user?.role || 'Admin'}
              </p>
            </div>
          </button>

          {isProfileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {user?.role || 'Administrator'}
                </span>
              </div>

              <div className="p-1">
                <Link
                  to="/"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Store className="w-4 h-4 text-slate-400" />
                  View Storefront
                </Link>
                <Link
                  to="/account"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Customer Account
                </Link>
              </div>

              <div className="border-t border-slate-100 my-1"></div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
