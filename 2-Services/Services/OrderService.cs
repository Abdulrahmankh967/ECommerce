using _1_Repository.Data;
using _1_Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace _2_Services.Services
{
    public class OrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;
        private readonly ICouponRepository _couponRepository;
        private readonly ICouponUsageRepository _couponUsageRepository;
        private readonly CouponService _couponService;
        private readonly IUnitOfWork _unitOfWork;

        public OrderService(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IProductRepository productRepository,
            ICouponRepository couponRepository,
            ICouponUsageRepository couponUsageRepository,
            CouponService couponService,
            IUnitOfWork unitOfWork)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _couponRepository = couponRepository;
            _couponUsageRepository = couponUsageRepository;
            _couponService = couponService;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<OrderDetailDto>> GetOrdersByCustomerAsync(int customerId)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            var orders = await _orderRepository.GetCustomerOrdersAsync(customerId);
            return orders.Select(MapToDetailDto).ToList();
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

            return MapToDetailDto(order);
        }

        public async Task<OrderDetailDto> PlaceOrderAsync(int customerId, PlaceOrderDto dto)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            if (dto == null)
                throw new BadRequestException("Order placement data is required.");

            var cart = await _cartRepository.GetCartWithItemsAsync(customerId);
            if (cart == null || !cart.CartItems.Any())
                throw new BadRequestException("Cart is empty. Add items before placing an order.");

            decimal subtotal = 0;
            var orderItems = new List<OrderItem>();

            // 1. Verify stock and populate items
            foreach (var item in cart.CartItems)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product == null)
                    throw new NotFoundException($"Product with ID {item.ProductId} not found.");

                if (product.Stock < item.Quantity)
                    throw new BadRequestException($"Insufficient stock for '{product.Name}'. Available: {product.Stock}, requested: {item.Quantity}.");

                orderItems.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });

                subtotal += product.Price * item.Quantity;

                // Deduct stock
                product.Stock -= item.Quantity;
                _productRepository.Update(product);
            }

            // 2. Validate and apply coupon
            decimal discount = 0;
            Coupon? coupon = null;
            if (!string.IsNullOrWhiteSpace(dto.CouponCode))
            {
                coupon = await _couponService.ValidateAndGetCouponAsync(customerId, dto.CouponCode);
                if (coupon.DiscountType.Equals("Percentage", StringComparison.OrdinalIgnoreCase))
                {
                    discount = subtotal * (coupon.DiscountValue / 100);
                }
                else if (coupon.DiscountType.Equals("FixedAmount", StringComparison.OrdinalIgnoreCase))
                {
                    discount = coupon.DiscountValue;
                }

                // Make sure discount doesn't exceed subtotal
                if (discount > subtotal)
                    discount = subtotal;
            }

            decimal finalTotal = subtotal - discount;

            // 3. Create Order
            var order = new Order
            {
                CustomerId = customerId,
                OrderDate = DateTime.UtcNow,
                TotalPrice = finalTotal,
                OrderItems = orderItems
            };

            await _orderRepository.AddAsync(order);

            // 4. Create Payment
            var payment = new Payment
            {
                Amount = finalTotal,
                PaymentDate = DateTime.UtcNow,
                Method = dto.PaymentMethod,
                Order = order
            };
            order.Payment = payment;

            // 5. Create Shipment
            var shipment = new Shipment
            {
                Status = "Pending",
                EstimatedDeliveryDate = DateTime.UtcNow.AddDays(5),
                Order = order
            };
            order.Shipment = shipment;

            // 6. Record Coupon Usage
            if (coupon != null)
            {
                var usage = new CouponUsage
                {
                    CouponId = coupon.Id,
                    CustomerId = customerId,
                    Order = order,
                    UsedAt = DateTime.UtcNow
                };
                order.CouponUsage = usage;

                coupon.TimesUsed++;
                _couponRepository.Update(coupon);
            }

            // 7. Clear Cart
            cart.CartItems.Clear();
            _cartRepository.Update(cart);

            await _unitOfWork.SaveChangesAsync();

            var savedOrder = await _orderRepository.GetOrderWithItemsAsync(order.Id);
            return MapToDetailDto(savedOrder!);
        }

        private static OrderDetailDto MapToDetailDto(Order order) => new OrderDetailDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            TotalPrice = order.TotalPrice,
            CustomerId = order.CustomerId,
            PaymentMethod = order.Payment?.Method,
            ShipmentStatus = order.Shipment?.Status,
            CouponCode = order.CouponUsage?.Coupon?.Code,
            Items = order.OrderItems.Select(oi => new OrderItemDetailDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.Product?.Name ?? string.Empty,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                Subtotal = oi.UnitPrice * oi.Quantity
            }).ToList()
        };
    }
}
