import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api/wishlist.api';
import { useAuth } from '../hooks/useAuth';

export const WISHLIST_QUERY_KEY = ['wishlist'];

export const useWishlist = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: wishlistApi.getWishlist,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (productId: number) => wishlistApi.addToWishlist(productId),
    onSuccess: (updatedWishlist) => {
      queryClient.setQueryData(WISHLIST_QUERY_KEY, updatedWishlist);
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (wishlistItemId: number) => wishlistApi.removeFromWishlist(wishlistItemId),
    onSuccess: (updatedWishlist) => {
      queryClient.setQueryData(WISHLIST_QUERY_KEY, updatedWishlist);
    },
  });

  const isInWishlist = (productId: number) => {
    return wishlistQuery.data?.items?.some((item) => item.productId === productId) ?? false;
  };

  const getWishlistItemId = (productId: number) => {
    return wishlistQuery.data?.items?.find((item) => item.productId === productId)?.id;
  };

  return {
    wishlist: wishlistQuery.data,
    totalItems: wishlistQuery.data?.items?.length ?? 0,
    isLoading: wishlistQuery.isLoading,
    isInWishlist,
    getWishlistItemId,
    addToWishlist: addToWishlistMutation.mutateAsync,
    isAddingToWishlist: addToWishlistMutation.isPending,
    removeFromWishlist: removeFromWishlistMutation.mutateAsync,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
  };
};
