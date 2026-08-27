import { cartApi, wishlistApi } from "../api/services.js";
import { isAuthenticated } from "../auth/session.js";
import { ROOT_PATH } from "../config.js";
import { handleApiError } from "./errors.js";
import { toast } from "./toast.js";
import { refreshCartBadge } from "./layout.js";

export async function addToCart(product, quantity = 1) {
  if (!isAuthenticated()) {
    window.location.href = `${ROOT_PATH}/login.html?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }
  try {
    await cartApi.add({ productId: product.id, quantity });
    toast.success(`${product.name} added to cart`);
    refreshCartBadge();
  } catch (error) {
    handleApiError(error);
  }
}

export async function saveToWishlist(product) {
  if (!isAuthenticated()) {
    window.location.href = `${ROOT_PATH}/login.html?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }
  try {
    await wishlistApi.add(product.id);
    toast.success(`${product.name} saved to wishlist`);
  } catch (error) {
    handleApiError(error);
  }
}
