import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart.api';
import { useAuth } from '../hooks/useAuth';
import { AddToCartRequest, UpdateCartItemRequest } from '../types/api.types';

export const CART_QUERY_KEY = ['cart'];

export const useCart = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const addToCartMutation = useMutation({
    mutationFn: (data: AddToCartRequest) => cartApi.addToCart(data),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) =>
      cartApi.updateCartItem(cartItemId, { quantity }),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (cartItemId: number) => cartApi.removeFromCart(cartItemId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  return {
    cart: cartQuery.data,
    totalItems: cartQuery.data?.totalItems ?? 0,
    totalPrice: cartQuery.data?.totalPrice ?? 0,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    refetch: cartQuery.refetch,
    addToCart: addToCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,
    updateQuantity: updateQuantityMutation.mutateAsync,
    isUpdatingQuantity: updateQuantityMutation.isPending,
    removeFromCart: removeFromCartMutation.mutateAsync,
    isRemovingFromCart: removeFromCartMutation.isPending,
    clearCart: clearCartMutation.mutateAsync,
    isClearingCart: clearCartMutation.isPending,
  };
};
