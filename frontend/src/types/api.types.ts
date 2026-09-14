export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string;
}

export interface Category {
  id: number;
  name: string;
  productCount: number;
}

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  orders?: OrderDetail[];
}

export interface CustomerAddress {
  id: number;
  customerId: number;
  title: string;
  recipientName: string;
  phone: string;
  city: string;
  street: string;
  buildingNumber?: string | null;
  postalCode?: string | null;
  isDefault: boolean;
}

export interface CreateCustomerAddressRequest {
  title: string;
  recipientName: string;
  phone: string;
  city: string;
  street: string;
  buildingNumber?: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface UpdateCustomerAddressRequest {
  title: string;
  recipientName: string;
  phone: string;
  city: string;
  street: string;
  buildingNumber?: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  customerId: number;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  addedAt: string;
}

export interface Wishlist {
  id: number;
  customerId: number;
  items: WishlistItem[];
}

export interface OrderItemDetail {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ShippingAddressDto {
  shippingRecipientName: string;
  shippingPhone: string;
  shippingCity: string;
  shippingStreet: string;
  shippingBuildingNumber?: string | null;
  shippingPostalCode?: string | null;
}

export interface OrderDetail {
  id: number;
  orderDate: string;
  totalPrice: number;
  totalAmount?: number;
  customerId: number;
  customerName?: string;
  orderStatus?: string | number;
  status?: string;
  paymentMethod: string | null;
  shipmentStatus: string | null;
  couponCode: string | null;
  shippingAddress?: ShippingAddressDto | null;
  items: OrderItemDetail[];
  orderItems?: OrderItemDetail[];
}


export interface PlaceOrderRequest {
  paymentMethod: string;
  couponCode?: string | null;
  customerAddressId: number;
}

export enum DiscountType {
  Percentage = 1,
  FixedAmount = 2,
}

export interface Coupon {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  timesUsed: number;
  isActive: boolean;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  customerId: number;
  customerName: string;
  productId: number;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment?: string | null;
}

export interface Shipment {
  id: number;
  orderId: number;
  shipmentDate: string | null;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  status: string;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  verificationId: string;
}

export interface VerifyOTPRequest {
  verificationId: string;
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export interface UpdateCustomerRequest {
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  verificationId?: string;
}

export interface ResetPasswordRequest {
  verificationId: string;
  otp: string;
  newPassword: string;
}

// Admin Product Types
export interface CreateProductRequest {
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  categoryId: number;
  imageUrl?: string | null;
}

export interface UpdateProductRequest {
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  categoryId: number;
  imageUrl?: string | null;
}

// Admin Category Types
export interface CreateCategoryRequest {
  name: string;
}

// Admin Supplier Types
export interface Supplier {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
}

// Admin Coupon Types
export interface CreateCouponRequest {
  code: string;
  discountType: number; // 0: Percentage, 1: FixedAmount (matches DiscountType enum)
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  isActive: boolean;
}

// Admin Shipment Types
export interface UpdateShipmentRequest {
  status: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  shipmentDate?: string | null;
  estimatedDeliveryDate?: string | null;
  actualDeliveryDate?: string | null;
}

