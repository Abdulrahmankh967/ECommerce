using _1_Repository.Data;
using _1_Repository.Interfaces;
using Microsoft.Extensions.Logging;
using System.Runtime.CompilerServices;

namespace _2_Services.Services
{
    public class CartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CartService> _logger;
       
        public CartService(
            ICartRepository cartRepository,
            IProductRepository productRepository,
            IUnitOfWork unitOfWork,
            ILogger<CartService> logger)
        {
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }



        public async Task<CartDto> GetCartAsync(int customerId)
        {
            ValidateId(customerId, "Customer ID");

            var cart = await _cartRepository.GetCartWithItemsAsync(customerId);

            return cart != null ? CartMapper.MapToDto(cart) : EmptyCart(customerId);
        }

        public async Task<CartDto> AddToCartAsync(int customerId, AddToCartDto dto)
        {
            ValidateId(customerId, "Customer ID");
            if (dto == null || dto.Quantity <= 0) throw new BadRequestException("Invalid payload or quantity.");

            var product = await _productRepository.GetByIdAsync(dto.ProductId)
                ?? throw new NotFoundException($"Product {dto.ProductId} not found.");

            ValidateStock(product, dto.Quantity);

            var cart = await _cartRepository.GetCartWithItemsAsync(customerId) ?? CreateNewCart(customerId);

            var item = cart.CartItems.FirstOrDefault(ci => ci.ProductId == dto.ProductId);
            if (item != null)
            {
                ValidateStock(product, item.Quantity + dto.Quantity);
                item.Quantity += dto.Quantity;
                item.UnitPrice = product.Price;
            }
            else
            {
                cart.CartItems.Add(new CartItem { ProductId = dto.ProductId, Quantity = dto.Quantity, UnitPrice = product.Price });
            }

            return await SaveAndMapAsync(cart);
        }

        public async Task<CartDto> UpdateCartItemAsync(int customerId, int cartItemId, UpdateCartItemDto dto)
        {
            ValidateId(customerId, "Customer ID");
            if (dto == null || dto.Quantity <= 0) throw new BadRequestException("Invalid payload or quantity.");

            var (cart, item) = await GetCartAndItemAsync(customerId, cartItemId);
            var product = await _productRepository.GetByIdAsync(item.ProductId);

            if (product != null)
            {
                ValidateStock(product, dto.Quantity);
                item.UnitPrice = product.Price;
            }

            item.Quantity = dto.Quantity;
            return await SaveAndMapAsync(cart);
        }

        public async Task<CartDto> RemoveFromCartAsync(int customerId, int cartItemId)
        {
            ValidateId(customerId, "Customer ID");
            var (cart, item) = await GetCartAndItemAsync(customerId, cartItemId);

            cart.CartItems.Remove(item);
            return await SaveAndMapAsync(cart);
        }

        public async Task ClearCartAsync(int customerId)
        {
            ValidateId(customerId, "Customer ID");
            var cart = await _cartRepository.GetCartWithItemsAsync(customerId);
            if (cart == null) return;

            cart.CartItems.Clear();
            await SaveAndMapAsync(cart);
        }


        private static void ValidateId(int id, string paramName)
        {
            if (id <= 0) throw new BadRequestException($"{paramName} must be greater than zero.");
        }

        private static void ValidateStock(Product product, int quantity)
        {
            if (!product.IsActive) 
                throw new BadRequestException($"Product '{product.Name}' is unavailable.");

            if (product.Stock < quantity) 
                throw new BadRequestException($"Insufficient stock for '{product.Name}'.");
        }

        private async Task<(Cart Cart, CartItem Item)> GetCartAndItemAsync(int customerId, int cartItemId)
        {
            var cart = await _cartRepository.GetCartWithItemsAsync(customerId) ?? throw new NotFoundException("Cart not found.");
            var item = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId) ?? throw new NotFoundException($"Item {cartItemId} not found.");
            return (cart, item);
        }

        private Cart CreateNewCart(int customerId)
        {
            var cart = new Cart { CustomerId = customerId, CreatedAt = DateTime.UtcNow, CartItems = new List<CartItem>() };
            _cartRepository.AddAsync(cart);
            return cart;
        }

        private async Task<CartDto> SaveAndMapAsync(Cart cart)
        {
            cart.UpdatedAt = DateTime.UtcNow;
            _cartRepository.Update(cart);
            await _unitOfWork.SaveChangesAsync();
            return CartMapper.MapToDto(cart);
        }

        private static CartDto EmptyCart(int customerId) => new()
        {
            CustomerId = customerId,
            Items = new List<CartItemDto>(),
            TotalPrice = 0,
            TotalItems = 0
        };

    }
}