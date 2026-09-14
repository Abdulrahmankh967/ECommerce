import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Boxes,
  Ticket,
  Truck,
  Star,
  CreditCard,
  Building2,
  Store,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

const navSections = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Catalog & Stock',
    items: [
      { label: 'Products', path: '/admin/products', icon: Package },
      { label: 'Categories', path: '/admin/categories', icon: FolderTree },
      { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
    ],
  },
  {
    title: 'Sales & Logistics',
    items: [
      { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
      { label: 'Shipments', path: '/admin/shipments', icon: Truck },
      { label: 'Payments', path: '/admin/payments', icon: CreditCard },
      { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
    ],
  },
  {
    title: 'Relations',
    items: [
      { label: 'Customers', path: '/admin/customers', icon: Users },
      { label: 'Suppliers', path: '/admin/suppliers', icon: Building2 },
      { label: 'Reviews', path: '/admin/reviews', icon: Star },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileOpen, onClose }) => {
  const { user, logout } = useAuth();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#0B132B] text-slate-300">
      {/* Brand Header */}
      <div>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white tracking-tight">ShopNest</span>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Control Center</p>
            </div>
          </div>
          {/* Close for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="px-4 py-5 space-y-6 overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-thin scrollbar-thumb-slate-700">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / User Profile & Storefront Exit */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors group"
        >
          <span className="flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-400" />
            Back to Storefront
          </span>
          <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
        </Link>

        <div className="flex items-center justify-between pt-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 border-r border-slate-800/80 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
