using _2_Services.Interfaces;
using _2_Services.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace _3_RestfulAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CouponController : ControllerBase
    {
        private readonly ICouponService _couponService;

        public CouponController(ICouponService couponService)
        {
            _couponService = couponService;
        }

        /// <summary>
        /// Validates a coupon code for the authenticated customer without placing an order.
        /// Returns the coupon details (discount type and value) so the client can show a live preview.
        /// </summary>
        [HttpPost("validate")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(CouponDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponDto dto)
        {
            var coupon = await _couponService.ValidateAndGetCouponAsync(User.GetUserId(), dto.Code);
            return Ok(coupon);
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        [EnableRateLimiting("HighCostLimiter")]
        [ProducesResponseType(typeof(List<CouponDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllCoupons()
        {
            var coupons = await _couponService.GetAllCouponsAsync();
            return Ok(coupons);
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "admin")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(CouponDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCouponById(int id)
        {
            var coupon = await _couponService.GetCouponByIdAsync(id);
            return Ok(coupon);
        }

        [HttpGet("code/{code}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(CouponDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCouponByCode(string code)
        {
            var coupon = await _couponService.GetCouponByCodeAsync(code);
            if (coupon == null)
                return NotFound();

            return Ok(coupon);
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(CouponDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponDto dto)
        {
            var coupon = await _couponService.CreateCouponAsync(dto);
            return CreatedAtAction(nameof(GetCouponById), new { id = coupon.Id }, coupon);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "admin")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(CouponDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateCoupon(int id, [FromBody] CreateCouponDto dto)
        {
            var coupon = await _couponService.UpdateCouponAsync(id, dto);
            return Ok(coupon);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "admin")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCoupon(int id)
        {
            await _couponService.DeleteCouponAsync(id);
            return NoContent();
        }
    }
}
