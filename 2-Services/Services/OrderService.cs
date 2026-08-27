using _1_Repository.Data;
using _1_Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace _2_Services.Services
{
    public class OrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;
        private readonly CouponService _couponService;
        private readonly IUnitOfWork _unitOfWork;

        public OrderService(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IProductRepository productRepository,
            CouponService couponService,
            IUnitOfWork unitOfWork)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _couponService = couponService;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<OrderDetailDto>> GetOrdersByCustomerAsync(int customerId)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            var orders = await _orderRepository.GetCustomerOrdersAsync(customerId);
            return orders.Select(OrderMapper.MapToDetailDto).ToList();
        }

        public async Task<OrderDetailDto?> GetOrderByIdAsync(int orderId, int customerId, bool isAdmin)
        {
            if (orderId <= 0)
                throw new BadRequestException("Order ID must be greater than zero.");

            var order = await _orderRepository.GetOrderWithItemsAsync(orderId);

            if (order == null)
                throw new NotFoundException($"Order with ID {orderId} not found.");

            if (!isAdmin && order.CustomerId != customerId)
                throw new ForbiddenException("You do not have permission to view this order.");

            return OrderMapper.MapToDetailDto(order);
        }

        public async Task<OrderDetailDto> PlaceOrderAsync(int customerId, PlaceOrderDto dto)
        {

            ValidateOrder(customerId, dto);

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                Cart cart = await ValidateCart(customerId);


                (decimal subtotal, List<OrderItem> orderItems) = await BuildOrderWithItems(cart);

                (Coupon? coupon, decimal finalTotal) = await GetDiscount(customerId, dto, subtotal);

                Order order = ApplyDiscount(customerId, dto, orderItems, coupon, finalTotal);

                await _orderRepository.AddAsync(order);

                cart.CartItems.Clear();

                await _unitOfWork.SaveChangesAsync();

                await _unitOfWork.CommitTransactionAsync();

                return OrderMapper.MapToDetailDto(order);
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
        private static Order ApplyDiscount(int customerId, PlaceOrderDto dto, List<OrderItem> orderItems, Coupon? coupon, decimal finalTotal)
        {
            Order order = CreateOrder(customerId, dto, orderItems, finalTotal);

            if (coupon != null)
            {
                order.CouponUsage = new CouponUsage
                {
                    CouponId = coupon.Id,
                    Coupon = coupon,
                    CustomerId = customerId,
                    UsedAt = DateTime.UtcNow
                };
                coupon.TimesUsed++;
            }

            return order;
        }

        private static Order CreateOrder(int customerId, PlaceOrderDto dto, List<OrderItem> orderItems, decimal finalTotal)
        {
            return new Order
            {
                CustomerId = customerId,
                OrderDate = DateTime.UtcNow,
                TotalPrice = finalTotal,
                OrderItems = orderItems,
                Payment = new Payment
                {
                    Amount = finalTotal,
                    PaymentDate = DateTime.UtcNow,
                    Method = dto.PaymentMethod
                },
                Shipment = new Shipment
                {
                    Status = "Pending",
                    EstimatedDeliveryDate = DateTime.UtcNow.AddDays(5)
                }
            };
        }

        private async Task<(Coupon? coupon, decimal finalTotal)> GetDiscount(int customerId, PlaceOrderDto dto, decimal subtotal)
        {
            decimal discount = 0;
            Coupon? coupon = null;

            if (!string.IsNullOrWhiteSpace(dto.CouponCode))
            {
                coupon = await _couponService.ValidateAndGetCouponAsync(customerId, dto.CouponCode);

                if (coupon.DiscountType == 1)
                {
                    discount = subtotal * (coupon.DiscountValue / 100m);
                }
                else if (coupon.DiscountType == 2)
                {
                    discount = coupon.DiscountValue;
                }

                discount = Math.Min(discount, subtotal);
            }

            decimal finalTotal = subtotal - discount;
            return (coupon, finalTotal);
        }

        private async Task<(decimal subtotal, List<OrderItem> orderItems)> BuildOrderWithItems(Cart cart)
        {            

            decimal subtotal = 0;

            var orderItems = new List<OrderItem>();

            List<Product> productList = await GetProductsList(cart);

            var productsById = productList.ToDictionary(p => p.Id);

            var productQuantities = cart.CartItems.ToDictionary(item => item.ProductId,item => item.Quantity);
            var success = await _productRepository.UpdateStocksAsync(productQuantities);

            if (!success)
                throw new BadRequestException("Insufficient stock for one or more products.");

            foreach (var item in cart.CartItems)
            {
                if (!productsById.TryGetValue(item.ProductId, out var product))
                    throw new NotFoundException($"Product with ID {item.ProductId} not found.");

                orderItems.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });
                subtotal += product.Price * item.Quantity;
            }

            return (subtotal, orderItems);
        }

        private async Task<List<Product>> GetProductsList(Cart cart)
        {

            var productIds = cart.CartItems.Select(ci=>ci.ProductId).Distinct().ToList();

            var productList = await _productRepository.GetProductsByIdsAsync(productIds);

            if(productIds.Count != productList.Count)
            {
                var missingProductIds = productIds.Except(productList.Select(p => p.Id)).ToList();
                throw new NotFoundException($"Products with IDs {string.Join(", ", missingProductIds)} not found.");
            }

            return productList;
        }

        private async Task<Cart> ValidateCart(int customerId)
        {
            var cart = await _cartRepository.GetCartWithItemsAsync(customerId);

            if (cart == null || !cart.CartItems.Any())
                throw new BadRequestException("Cart is empty. Add items before placing an order.");
            return cart;
        }

        private static void ValidateOrder(int customerId, PlaceOrderDto dto)
        {
            if (customerId <= 0) throw new BadRequestException("Customer ID must be greater than zero.");

            if (dto == null) throw new BadRequestException("Order placement data is required.");
        }

        
    }
}
