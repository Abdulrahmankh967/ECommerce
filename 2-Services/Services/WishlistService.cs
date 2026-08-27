using _1_Repository.Data;
using _1_Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace _2_Services.Services
{
    public class WishlistService
    {
        private readonly IWishlistRepository _wishlistRepository;
        private readonly IProductRepository _productRepository;
        private readonly IUnitOfWork _unitOfWork;

        public WishlistService(
            IWishlistRepository wishlistRepository,
            IProductRepository productRepository,
            IUnitOfWork unitOfWork)
        {
            _wishlistRepository = wishlistRepository;
            _productRepository = productRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<WishlistDto> GetWishlistAsync(int customerId)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            var wishlist = await _wishlistRepository.GetWishlistByCustomerIdAsync(customerId);
            if (wishlist == null)
            {
                return new WishlistDto
                {
                    CustomerId = customerId,
                    Items = new List<WishlistItemDto>()
                };
            }

            return WishlistMapper.MapToDto(wishlist);
        }

        public async Task<WishlistDto> AddToWishlistAsync(int customerId, int productId)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            if (productId <= 0)
                throw new BadRequestException("Product ID must be greater than zero.");

            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null)
                throw new NotFoundException($"Product with ID {productId} not found.");

            var wishlist = await _wishlistRepository.GetWishlistByCustomerIdAsync(customerId);
            if (wishlist == null)
            {
                wishlist = new Wishlist
                {
                    CustomerId = customerId,
                    CreatedAt = DateTime.UtcNow
                };
                await _wishlistRepository.AddAsync(wishlist);
                await _unitOfWork.SaveChangesAsync();
                wishlist = await _wishlistRepository.GetWishlistByCustomerIdAsync(customerId);
            }

            var existing = wishlist!.WishlistItems.FirstOrDefault(wi => wi.ProductId == productId);
            if (existing == null)
            {
                wishlist.WishlistItems.Add(new WishlistItem
                {
                    WishlistId = wishlist.Id,
                    ProductId = productId,
                    AddedAt = DateTime.UtcNow
                });

                _wishlistRepository.Update(wishlist);
                await _unitOfWork.SaveChangesAsync();
            }

            var updated = await _wishlistRepository.GetWishlistByCustomerIdAsync(customerId);
            return WishlistMapper.MapToDto(updated!);
        }

        public async Task<WishlistDto> RemoveFromWishlistAsync(int customerId, int wishlistItemId)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            if (wishlistItemId <= 0)
                throw new BadRequestException("Wishlist item ID must be greater than zero.");

            var wishlist = await _wishlistRepository.GetWishlistByCustomerIdAsync(customerId);
            if (wishlist == null)
                throw new NotFoundException("Wishlist not found.");

            var item = wishlist.WishlistItems.FirstOrDefault(wi => wi.Id == wishlistItemId);
            if (item == null)
                throw new NotFoundException($"Wishlist item with ID {wishlistItemId} not found.");

            wishlist.WishlistItems.Remove(item);
            _wishlistRepository.Update(wishlist);
            await _unitOfWork.SaveChangesAsync();

            var updated = await _wishlistRepository.GetWishlistByCustomerIdAsync(customerId);
            return WishlistMapper.MapToDto(updated!);
        }

        public async Task ClearWishlistAsync(int customerId)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            var wishlist = await _wishlistRepository.GetWishlistByCustomerIdAsync(customerId);
            if (wishlist == null)
                return;

            wishlist.WishlistItems.Clear();
            _wishlistRepository.Update(wishlist);
            await _unitOfWork.SaveChangesAsync();
        }

        
    }
}
