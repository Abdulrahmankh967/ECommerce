using _1_Repository.Data;
using _1_Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace _2_Services.Services
{
    public class CartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly ICartItemRepository _cartItemRepository;
        private readonly IProductRepository _productRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CartService(ICartRepository cartRepository, IProductRepository productRepository, IUnitOfWork unitOfWork, ICartItemRepository cartItemRepository)
        {
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _unitOfWork = unitOfWork;
            _cartItemRepository = cartItemRepository;
        }

        public async Task<CartDto> GetCartAsync(int customerId)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            var cart = await _cartRepository.GetCartWithItemsAsync(customerId);
            if (cart == null)
            {
                return new CartDto
                {
                    CustomerId = customerId,
                    Items = new List<CartItemDto>(),
                    TotalPrice = 0,
                    TotalItems = 0
                };
            }

            return CartMapper.MapToDto(cart);
        }

        public async Task<CartDto> AddToCartAsync(int customerId, AddToCartDto dto)
        {
            // 1. Validation
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            if (dto == null)
                throw new BadRequestException("Cart item data is required.");

            // 2. Fetch Product (Tracked or AsNoTracking)
            var product = await _productRepository.GetByIdAsync(dto.ProductId);
            if (product == null)
                throw new NotFoundException($"Product with ID {dto.ProductId} not found.");

            if (product.Stock < dto.Quantity)
                throw new BadRequestException($"Insufficient stock for '{product.Name}'. Available: {product.Stock}.");

            // 3. Fetch Cart or Create New One
            var cart = await _cartRepository.GetCartWithItemsAsync(customerId);

            if (cart == null)
            {
                cart = new Cart
                {
                    CustomerId = customerId,
                    CreatedAt = DateTime.UtcNow,
                    CartItems = new List<CartItem>()
                };
                await _cartRepository.AddAsync(cart); 
            }

            
            var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == dto.ProductId);

            if (existingItem != null)
            {
                int newQty = existingItem.Quantity + dto.Quantity;
                if (newQty > product.Stock)
                    throw new BadRequestException($"Cannot add more than {product.Stock} of this item.");

                existingItem.Quantity = newQty;
                existingItem.UnitPrice = product.Price;
            }
            else
            {
                cart.CartItems.Add(new CartItem
                {
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                    UnitPrice = product.Price
                });
            }
            
            cart.UpdatedAt = DateTime.UtcNow;

            
            await _unitOfWork.SaveChangesAsync();

            
            return CartMapper.MapToDto(cart);
        }

        public async Task<CartDto> UpdateCartItemAsync(int customerId, int cartItemId, UpdateCartItemDto dto)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            if (dto == null)
                throw new BadRequestException("Cart item data is required.");

            var cart = await _cartRepository.GetCartWithItemsAsync(customerId);
            if (cart == null)
                throw new NotFoundException("Cart not found.");

            var item = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);
            if (item == null)
                throw new NotFoundException($"Cart item with ID {cartItemId} not found.");

            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product != null && dto.Quantity > product.Stock)
                throw new BadRequestException($"Insufficient stock for '{product.Name}'. Available: {product.Stock}.");

            item.Quantity = dto.Quantity;
            if (product != null)
            {
                item.UnitPrice = product.Price;
            }

            cart.UpdatedAt = DateTime.UtcNow;
            _cartRepository.Update(cart);
            await _unitOfWork.SaveChangesAsync();

            var updatedCart = await _cartRepository.GetCartWithItemsAsync(customerId);
            return CartMapper.MapToDto(updatedCart!);
        }

        public async Task<CartDto> RemoveFromCartAsync(int customerId, int cartItemId)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            var cart = await _cartRepository.GetCartWithItemsAsync(customerId);
            if (cart == null)
                throw new NotFoundException("Cart not found.");

            var item = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);
            if (item == null)
                throw new NotFoundException($"Cart item with ID {cartItemId} not found.");

            cart.CartItems.Remove(item);
            cart.UpdatedAt = DateTime.UtcNow;
            _cartRepository.Update(cart);
            await _unitOfWork.SaveChangesAsync();

            var updatedCart = await _cartRepository.GetCartWithItemsAsync(customerId);
            return CartMapper.MapToDto(updatedCart!);
        }

        public async Task ClearCartAsync(int customerId)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            var cart = await _cartRepository.GetCartWithItemsAsync(customerId);
            if (cart == null)
                return;

            cart.CartItems.Clear();
            cart.UpdatedAt = DateTime.UtcNow;
            _cartRepository.Update(cart);
            await _unitOfWork.SaveChangesAsync();
        }

        
    }
}
