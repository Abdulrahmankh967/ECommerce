import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from './Spinner';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-200">
        <Spinner size="lg" />
        <p className="mt-4 text-sm font-medium tracking-wide text-slate-400">Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user?.role?.toLowerCase();
  const isAdmin = role === 'admin' || role === 'superadmin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            You do not have administrative privileges to access the ShopNest Control Center. This area is reserved for verified administrators.
          </p>
          <div className="bg-slate-800/50 rounded-xl p-3 mb-6 text-left border border-slate-800">
            <p className="text-xs text-slate-400">Signed in as:</p>
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-400 capitalize">Role: <span className="text-amber-400 font-medium">{user?.role || 'Customer'}</span></p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Storefront
            </Link>
            <button
              onClick={() => logout()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
