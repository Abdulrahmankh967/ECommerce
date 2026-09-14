import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth.api';
import { ordersApi } from '../api/orders.api';
import { addressesApi } from '../api/addresses.api';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Spinner } from '../components/common/Spinner';
import {
  User,
  Package,
  MapPin,
  Heart,
  Shield,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  ShoppingCart,
  Eye,
  Lock
} from 'lucide-react';
import { CreateCustomerAddressRequest } from '../types/api.types';

export const MyAccountPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';
  const queryClient = useQueryClient();

  const { user, logout, updateUser } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressTitle, setAddressTitle] = useState('Home');
  const [recipientName, setRecipientName] = useState(user?.fullName || '');
  const [addressPhone, setAddressPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone);
      setEmail(user.email);
    }
  }, [user]);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Fetch customer orders
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getOrders,
  });

  // Fetch customer addresses
  const { data: addresses = [], isLoading: isAddressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesApi.getAddresses,
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateCurrentCustomer,
    onSuccess: () => {
      if (user) {
        updateUser({ ...user, fullName, phone, email });
      }
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    },
    onError: (err: any) => {
      setProfileError(err?.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    updateProfileMutation.mutate({ fullName, phone, email });
  };

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      setPasswordSuccess('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    },
    onError: (err: any) => {
      setPasswordError(err?.response?.data?.message || 'Failed to change password');
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 5) {
      setPasswordError('New password must be at least 5 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    changePasswordMutation.mutate({ newPassword });
  };

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: (data: CreateCustomerAddressRequest) => addressesApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setIsAddressModalOpen(false);
      // Reset form
      setCity('');
      setStreet('');
      setBuildingNumber('');
      setPostalCode('');
      setIsDefaultAddress(false);
      setAddressError('');
    },
    onError: (err: any) => {
      setAddressError(err?.response?.data?.message || 'Failed to save address');
    },
  });

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');

    if (!recipientName || !addressPhone || !city || !street) {
      setAddressError('Please fill in all required address fields.');
      return;
    }

    createAddressMutation.mutate({
      title: addressTitle,
      recipientName,
      phone: addressPhone,
      city,
      street,
      buildingNumber: buildingNumber || undefined,
      postalCode: postalCode || undefined,
      isDefault: isDefaultAddress,
    });
  };

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: addressesApi.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const handleMoveWishlistToCart = async (productId: number, wishlistItemId: number) => {
    try {
      await addToCart({ productId, quantity: 1 });
      await removeFromWishlist(wishlistItemId);
    } catch (err) {
      console.error('Failed to move wishlist item to cart', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Account Header matching Screenshot Image 1, Frame 4 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-600/30">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.fullName}</h1>
            <p className="text-xs text-slate-500">{user?.email} • {user?.phone}</p>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <Badge variant="primary" size="sm">
                Verified Member
              </Badge>
              <Badge variant="neutral" size="sm">
                Role: {user?.role || 'Customer'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-lg font-black text-slate-900">{orders.length}</span>
            <p className="text-[11px] text-slate-400 font-semibold">Total Orders</p>
          </div>
          <div className="text-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-lg font-black text-slate-900">{wishlist?.items?.length || 0}</span>
            <p className="text-[11px] text-slate-400 font-semibold">Wishlist</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Navigation Tabs & Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm space-y-1">
          <button
            onClick={() => setTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${currentTab === 'profile'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Information</span>
          </button>

          <button
            onClick={() => setTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${currentTab === 'orders'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>Orders History</span>
            </div>
            {orders.length > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${currentTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${currentTab === 'addresses'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Shipping Addresses</span>
          </button>

          <button
            onClick={() => setTab('wishlist')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${currentTab === 'wishlist'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4" />
              <span>My Wishlist</span>
            </div>
            {(wishlist?.items?.length || 0) > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${currentTab === 'wishlist' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                {wishlist?.items?.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${currentTab === 'security'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Password</span>
          </button>

          <div className="border-t border-slate-100 my-2"></div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Main Content */}
        <div className="lg:col-span-3">

          {/* 1. Profile Tab */}
          {currentTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                  <p className="text-xs text-slate-500">Update your contact information and preferences.</p>
                </div>
              </div>

              {profileSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <Button
                  type="submit"
                  isLoading={updateProfileMutation.isPending}
                  className="rounded-xl"
                  size="sm"
                >
                  Save Changes
                </Button>
              </form>
            </div>
          )}

          {/* 2. Orders History Tab matching Screenshot Image 1, Frame 4 */}
          {currentTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
                  <p className="text-xs text-slate-500">Track and view your recent purchases and invoices.</p>
                </div>
              </div>

              {isOrdersLoading ? (
                <div className="py-12 flex justify-center">
                  <Spinner />
                </div>
              ) : orders.length === 0 ? (
                <div className="pt-8 pb-10 text-center space-y-3">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="py-6 text-center space-y-3">You have not placed any orders yet.</p>
                  <Link to="/shop">
                    <Button size="sm">Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 font-bold text-slate-900">
                            #ORD-{ord.id.toString().padStart(4, '0')}
                          </td>
                          <td className="py-3.5 text-slate-600">{formatDate(ord.orderDate)}</td>
                          <td className="py-3.5">
                            <Badge
                              variant={
                                ord.shipmentStatus?.toLowerCase() === 'delivered'
                                  ? 'success'
                                  : ord.shipmentStatus?.toLowerCase() === 'shipped'
                                    ? 'info'
                                    : 'warning'
                              }
                              size="sm"
                            >
                              {ord.shipmentStatus || 'Processing'}
                            </Badge>
                          </td>
                          <td className="py-3.5 font-bold text-slate-900">
                            {formatCurrency(ord.totalPrice)}
                          </td>
                          <td className="py-3.5 text-right">
                            <Link
                              to={`/orders/${ord.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. Addresses Tab */}
          {currentTab === 'addresses' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Saved Addresses</h3>
                  <p className="text-xs text-slate-500">Manage your shipping and billing destinations.</p>
                </div>
                <Button
                  onClick={() => setIsAddressModalOpen(true)}
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Address
                </Button>
              </div>

              {isAddressesLoading ? (
                <div className="py-12 flex justify-center">
                  <Spinner />
                </div>
              ) : addresses.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">No saved addresses found. Add an address for faster checkout.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-2xl border transition-all ${addr.isDefault
                        ? 'border-blue-400 bg-blue-50/30'
                        : 'border-slate-200/80 bg-white'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{addr.title}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteAddressMutation.mutate(addr.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs font-semibold text-slate-800">{addr.recipientName}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {addr.street} {addr.buildingNumber && `, Bldg ${addr.buildingNumber}`}
                      </p>
                      <p className="text-xs text-slate-500">{addr.city} {addr.postalCode}</p>
                      <p className="text-xs text-slate-400 mt-2">Phone: {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Wishlist Tab */}
          {currentTab === 'wishlist' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Saved Wishlist</h3>
                  <p className="text-xs text-slate-500">Products you're planning to purchase later.</p>
                </div>
              </div>

              {!wishlist?.items || wishlist.items.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">Your wishlist is currently empty.</p>
                  <Link to="/shop">
                    <Button size="sm">Discover Products</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlist.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <Link to={`/product/${item.productId}`}>
                            <h4 className="text-xs font-bold text-slate-900 hover:text-blue-600 line-clamp-2">
                              {item.productName}
                            </h4>
                          </Link>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-black text-slate-900 mt-2">
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100">
                        <Button
                          onClick={() => handleMoveWishlistToCart(item.productId, item.id)}
                          size="sm"
                          className="w-full text-xs rounded-xl"
                          leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
                        >
                          Move to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. Security & Change Password Tab */}
          {currentTab === 'security' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Security Settings</h3>
                  <p className="text-xs text-slate-500">Update your account password to protect your data.</p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 5 characters"
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <Button
                  type="submit"
                  isLoading={changePasswordMutation.isPending}
                  size="sm"
                  className="rounded-xl"
                >
                  Update Password
                </Button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Shipping Address"
        maxWidth="md"
      >
        <form onSubmit={handleAddressSubmit} className="space-y-4">
          {addressError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600">
              {addressError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Address Title"
              value={addressTitle}
              onChange={(e) => setAddressTitle(e.target.value)}
              placeholder="e.g. Home, Office"
            />
            <Input
              label="Recipient Name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={addressPhone}
              onChange={(e) => setAddressPhone(e.target.value)}
              placeholder="Phone number"
            />
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. San Francisco"
            />
          </div>

          <Input
            label="Street Address"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="e.g. 123 Market Street"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Building / Suite (Optional)"
              value={buildingNumber}
              onChange={(e) => setBuildingNumber(e.target.value)}
              placeholder="Apt 4B"
            />
            <Input
              label="Postal Code (Optional)"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="94103"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isDefaultAddress}
              onChange={(e) => setIsDefaultAddress(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Set as default shipping address</span>
          </label>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createAddressMutation.isPending}
            >
              Save Address
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
