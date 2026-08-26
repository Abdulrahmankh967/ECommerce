using _2_Services.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace _3_RestfulAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ShipmentController : ControllerBase
    {
        private readonly ShipmentService _shipmentService;
        private readonly OrderService _orderService;

        public ShipmentController(ShipmentService shipmentService, OrderService orderService)
        {
            _shipmentService = shipmentService;
            _orderService = orderService;
        }

        [HttpGet("{id:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(ShipmentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetShipmentById(int id)
        {
            var shipment = await _shipmentService.GetShipmentByIdAsync(id);
            await EnsureOrderAccessAsync(shipment!.OrderId);
            return Ok(shipment);
        }

        [HttpGet("order/{orderId:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(ShipmentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetShipmentByOrderId(int orderId)
        {
            await EnsureOrderAccessAsync(orderId);
            var shipment = await _shipmentService.GetShipmentByOrderIdAsync(orderId);
            return Ok(shipment);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "admin")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(ShipmentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateShipmentStatus(int id, [FromBody] UpdateShipmentDto dto)
        {
            var shipment = await _shipmentService.UpdateShipmentStatusAsync(id, dto);
            return Ok(shipment);
        }

        private async Task EnsureOrderAccessAsync(int orderId)
        {
            await _orderService.GetOrderByIdAsync(orderId, User.GetUserId(), User.IsAdmin());
        }
    }
}
