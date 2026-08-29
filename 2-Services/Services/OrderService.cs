using _1_Repository.Data;
using _1_Repository.Interfaces;

namespace _2_Services.Services
{
    public class OrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;
        private readonly CouponService _couponService;
        private readonly CustomerService _customerService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderEmailQueue _orderEmailQueue;
        private readonly OutBoxMessageService _outBoxMessageService;

        public OrderService(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IProductRepository productRepository,
            CouponService couponService,
            CustomerService customerService,
            IUnitOfWork unitOfWork,
            IOrderEmailQueue orderEmailQueue,
            OutBoxMessageService outBoxMessageService)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _couponService = couponService;
            _customerService = customerService;
            _unitOfWork = unitOfWork;
            _orderEmailQueue = orderEmailQueue;
            _outBoxMessageService = outBoxMessageService;
        }

        public async Task<List<OrderDetailDto>> GetOrdersByCustomerAsync(int customerId)
        {
            ValidateId(customerId, "Customer ID");
            var orders = await _orderRepository.GetCustomerOrdersAsync(customerId);
            return orders.Select(OrderMapper.MapToDetailDto).ToList();
        }

        public async Task<OrderDetailDto?> GetOrderByIdAsync(int orderId, int customerId, bool isAdmin)
        {
            ValidateId(orderId, "Order ID");
            var order = await _orderRepository.GetOrderWithItemsAsync(orderId)
                ?? throw new NotFoundException($"Order {orderId} not found.");

            if (!isAdmin && order.CustomerId != customerId)
                throw new ForbiddenException("You do not have permission to view this order.");

            return OrderMapper.MapToDetailDto(order);
        }

        public async Task<OrderDetailDto> PlaceOrderAsync(int customerId, PlaceOrderDto dto)
        {
            ValidateId(customerId, "Customer ID");

            if (dto is null)
            {
                throw new BadRequestException("Order placement data is required.");
            }

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var cart = await ValidateCartAsync(customerId);

                var customer = await _customerService.GetCustomerByIdAsync(customerId)
                    ?? throw new NotFoundException($"Customer {customerId} not found.");

                var (subtotal, orderItems) = await BuildOrderWithItemsAsync(cart);
                var (coupon, finalTotal) = await CalculateDiscountAsync(customerId, dto.CouponCode, subtotal);

                var order = CreateOrderEntity(customerId, dto, orderItems, coupon, finalTotal);

                await _orderRepository.AddAsync(order);
                cart.CartItems.Clear();

                await _outBoxMessageService.CreateAndAddMessageAsync("OrderEmail", new { Email = customer.Email, OrderId = order.Id });

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();


                await _orderEmailQueue.EnqueueAsync(new OrderEmailMessage(order.Id, customer.Email));

                return OrderMapper.MapToDetailDto(order);
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }


        private static void ValidateId(int id, string paramName)
        {
            if (id <= 0) throw new BadRequestException($"{paramName} must be greater than zero.");
        }

        private async Task<Cart> ValidateCartAsync(int customerId)
        {
            var cart = await _cartRepository.GetCartWithItemsAsync(customerId);
            if (cart == null || !cart.CartItems.Any())
                throw new BadRequestException("Cart is empty. Add items before placing an order.");
            return cart;
        }

        private async Task<(decimal Subtotal, List<OrderItem> Items)> BuildOrderWithItemsAsync(Cart cart)
        {  
            var productIds = cart.CartItems.Select(ci => ci.ProductId).Distinct().ToList();
            var products = await _productRepository.GetProductsByIdsAsync(productIds);

            if (productIds.Count != products.Count)
            {
                var missingNames = productIds.Except(products.Select(p => p.Id));
                throw new NotFoundException($"Products with IDs {string.Join(", ", missingNames)} not found.");
            }

            var productQuantities = cart.CartItems.ToDictionary(i => i.ProductId, i => i.Quantity);

            if (!await _productRepository.UpdateStocksAsync(productQuantities))
            {
                throw new BadRequestException("Insufficient stock for one or more products.");
            }

            var productsDict = products.ToDictionary(p => p.Id);

            decimal subtotal = 0;
            var items = new List<OrderItem>();

            foreach (var item in cart.CartItems)
            {
                var product = productsDict[item.ProductId];

                items.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });

                subtotal += product.Price * item.Quantity;
            }

            return (subtotal, items);
        }

        private async Task<(CouponDto? Coupon, decimal FinalTotal)> CalculateDiscountAsync(int customerId, string? couponCode, decimal subtotal)
        {
            if (string.IsNullOrWhiteSpace(couponCode))
            {
                return (null, subtotal);
            }

            var coupon = await _couponService.ValidateAndGetCouponAsync(customerId, couponCode);

            decimal discount = coupon.DiscountType switch
            {
                DiscountType.Percentage => subtotal * (coupon.DiscountValue / 100m), // Percentage
                DiscountType.FixedAmount => coupon.DiscountValue,                    // FixedAmount
                _ => 0m
            };

            discount = Math.Min(discount, subtotal);


            return (coupon, subtotal - discount);
        }

        private static Order CreateOrderEntity(int customerId, PlaceOrderDto dto, List<OrderItem> items, CouponDto? coupon, decimal finalTotal)
        {
            var order = new Order
            {
                CustomerId = customerId,
                OrderDate = DateTime.UtcNow,
                TotalPrice = finalTotal,
                OrderItems = items,
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

            if (coupon != null)
            {
                order.CouponUsage = new CouponUsage
                {
                    CouponId = coupon.Id,
                    CustomerId = customerId,
                    UsedAt = DateTime.UtcNow
                };
                coupon.TimesUsed++;
            }

            return order;
        }
    }
}