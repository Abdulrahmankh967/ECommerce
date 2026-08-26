using _2_Services.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace _3_RestfulAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;
        private readonly OrderService _orderService;

        public PaymentController(PaymentService paymentService, OrderService orderService)
        {
            _paymentService = paymentService;
            _orderService = orderService;
        }

        [HttpGet("{id:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPaymentById(int id)
        {
            var payment = await _paymentService.GetPaymentByIdAsync(id);
            await EnsureOrderAccessAsync(payment!.OrderId);
            return Ok(payment);
        }

        [HttpGet("order/{orderId:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPaymentByOrderId(int orderId)
        {
            await EnsureOrderAccessAsync(orderId);
            var payment = await _paymentService.GetPaymentByOrderIdAsync(orderId);
            return Ok(payment);
        }

        private async Task EnsureOrderAccessAsync(int orderId)
        {
            await _orderService.GetOrderByIdAsync(orderId, User.GetUserId(), User.IsAdmin());
        }
    }
}
