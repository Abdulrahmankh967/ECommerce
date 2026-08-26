using _2_Services.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace _3_RestfulAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly OrderService _orderService;

        public OrderController(OrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet]
        [EnableRateLimiting("HighCostLimiter")]
        [ProducesResponseType(typeof(List<OrderDetailDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _orderService.GetOrdersByCustomerAsync(User.GetUserId());
            return Ok(orders);
        }

        [HttpGet("{orderId:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrderById(int orderId)
        {
            var order = await _orderService.GetOrderByIdAsync(orderId, User.GetUserId(), User.IsAdmin());
            return Ok(order);
        }

        [HttpPost]
        [EnableRateLimiting("HighCostLimiter")]
        [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderDto dto)
        {
            var order = await _orderService.PlaceOrderAsync(User.GetUserId(), dto);
            return CreatedAtAction(nameof(GetOrderById), new { orderId = order.Id }, order);
        }
    }
}
