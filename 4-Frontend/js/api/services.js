import { http } from "./http.js";

const memoryCache = new Map();

function cached(key, fn, ttlMs = 60000) {
  const hit = memoryCache.get(key);
  if (hit && Date.now() < hit.expires) return hit.value;
  const value = fn();
  memoryCache.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

export function invalidateCache(prefix = "") {
  for (const key of [...memoryCache.keys()]) {
    if (!prefix || key.startsWith(prefix)) memoryCache.delete(key);
  }
}

export const authApi = {
  register: (dto) => http.post("/api/Auth/register", dto, { auth: false }),
  login: (email, password) =>
    http.post("/api/Auth/login", { email, password }, { auth: false }),
  verifyEmail: (verificationId, otp) =>
    http.post("/api/Auth/verify-email", { verificationId, otp }, { auth: false }),
  refresh: (refreshToken) =>
    http.post("/api/Auth/refresh", { refreshToken }, { auth: false }),
  logout: (refreshToken) =>
    http.post("/api/Auth/logout", { refreshToken })
};

export const customersApi = {
  getById: (id) => http.get(`/api/Customers/GetById/${id}`),
  getAll: () => http.get("/api/Customers/GetAll"),
  getWithOrders: (customerId) => http.get(`/api/Customers/GetCustomerWithOrders/${customerId}`),
  getByPage: (pageNumber, pageSize) =>
    http.get(`/api/Customers/GetCustomersByPage?pageNumber=${pageNumber}&pageSize=${pageSize}`),
  create: (dto) => http.post("/api/Customers/AddCustomer", dto),
  updateCurrent: (dto) => http.put("/api/Customers", dto),
  update: (id, dto) => http.put(`/api/Customers/${id}`, dto),
  changePassword: (dto) => http.post("/api/Customers/change-password", dto),
  remove: (id) => http.delete(`/api/Customers/${id}`)
};

export const addressesApi = {
  list: () => http.get("/api/customers/addresses"),
  get: (addressId) => http.get(`/api/customers/addresses/${addressId}`),
  create: (dto) => http.post("/api/customers/addresses", dto),
  update: (addressId, dto) => http.put(`/api/customers/addresses/${addressId}`, dto),
  remove: (addressId) => http.delete(`/api/customers/addresses/${addressId}`)
};

export const productsApi = {
  list: () => cached("products", () => http.get("/api/Product", { auth: false })),
  get: (id) => http.get(`/api/Product/${id}`, { auth: false }),
  byCategory: (categoryId) =>
    cached(`products:cat:${categoryId}`, () =>
      http.get(`/api/Product/category/${categoryId}`, { auth: false })
    ),
  create: (dto) => http.post("/api/Product", dto).then((result) => {
    invalidateCache("products");
    return result;
  }),
  update: (id, dto) => http.put(`/api/Product/${id}`, dto).then((result) => {
    invalidateCache("products");
    return result;
  }),
  remove: (id) => http.delete(`/api/Product/${id}`).then((result) => {
    invalidateCache("products");
    return result;
  })
};

export const categoriesApi = {
  list: () => cached("categories", () => http.get("/api/Category", { auth: false })),
  get: (id) => http.get(`/api/Category/${id}`, { auth: false }),
  create: (dto) => http.post("/api/Category", dto).then((result) => {
    invalidateCache("categories");
    return result;
  }),
  update: (id, dto) => http.put(`/api/Category/${id}`, dto).then((result) => {
    invalidateCache("categories");
    return result;
  }),
  remove: (id) => http.delete(`/api/Category/${id}`).then((result) => {
    invalidateCache("categories");
    return result;
  })
};

export const cartApi = {
  get: () => http.get("/api/Cart"),
  add: (dto) => http.post("/api/Cart/items", dto),
  updateItem: (cartItemId, dto) => http.put(`/api/Cart/items/${cartItemId}`, dto),
  removeItem: (cartItemId) => http.delete(`/api/Cart/items/${cartItemId}`),
  clear: () => http.delete("/api/Cart")
};

export const ordersApi = {
  list: () => http.get("/api/Order"),
  get: (orderId) => http.get(`/api/Order/${orderId}`),
  place: (dto) => http.post("/api/Order", dto)
};

export const wishlistApi = {
  get: () => http.get("/api/Wishlist"),
  add: (productId) => http.post(`/api/Wishlist/items/${productId}`),
  removeItem: (wishlistItemId) => http.delete(`/api/Wishlist/items/${wishlistItemId}`),
  clear: () => http.delete("/api/Wishlist")
};

export const couponsApi = {
  list: () => http.get("/api/Coupon"),
  get: (id) => http.get(`/api/Coupon/${id}`),
  getByCode: (code) => http.get(`/api/Coupon/code/${encodeURIComponent(code)}`),
  create: (dto) => http.post("/api/Coupon", dto),
  update: (id, dto) => http.put(`/api/Coupon/${id}`, dto),
  remove: (id) => http.delete(`/api/Coupon/${id}`)
};

export const reviewsApi = {
  byProduct: (productId) => http.get(`/api/Review/product/${productId}`, { auth: false }),
  add: (dto) => http.post("/api/Review", dto),
  remove: (reviewId) => http.delete(`/api/Review/${reviewId}`)
};

export const suppliersApi = {
  list: () => http.get("/api/Supplier"),
  active: () => cached("suppliers:active", () => http.get("/api/Supplier/active", { auth: false })),
  get: (id) => http.get(`/api/Supplier/${id}`, { auth: false }),
  create: (dto) => http.post("/api/Supplier", dto),
  update: (id, dto) => http.put(`/api/Supplier/${id}`, dto),
  remove: (id) => http.delete(`/api/Supplier/${id}`)
};

export const paymentsApi = {
  get: (id) => http.get(`/api/Payment/${id}`),
  byOrder: (orderId) => http.get(`/api/Payment/order/${orderId}`)
};

export const shipmentsApi = {
  get: (id) => http.get(`/api/Shipment/${id}`),
  byOrder: (orderId) => http.get(`/api/Shipment/order/${orderId}`),
  update: (id, dto) => http.put(`/api/Shipment/${id}`, dto)
};
