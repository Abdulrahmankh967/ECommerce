import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';
import { AdminLayout } from './layouts/AdminLayout';

// Client Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DealsPage } from './pages/DealsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { MyAccountPage } from './pages/MyAccountPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminSuppliersPage } from './pages/admin/AdminSuppliersPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminShipmentsPage } from './pages/admin/AdminShipmentsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Dedicated Admin Portal */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="suppliers" element={<AdminSuppliersPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="shipments" element={<AdminShipmentsPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
            </Route>

            {/* Client Storefront Routes */}
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="deals" element={<DealsPage />} />
              <Route path="product/:id" element={<ProductDetailsPage />} />
              <Route path="about" element={<AboutPage />} />

              {/* Auth Routes */}
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />

              {/* Protected Customer Routes */}
              <Route
                path="account"
                element={
                  <ProtectedRoute>
                    <MyAccountPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="order-confirmation/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderConfirmationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetailsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
