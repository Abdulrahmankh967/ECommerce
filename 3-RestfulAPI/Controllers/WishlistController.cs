using _2_Services.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace _3_RestfulAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class WishlistController : ControllerBase
    {
        private readonly WishlistService _wishlistService;

        public WishlistController(WishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        [HttpGet]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(WishlistDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetWishlist()
        {
            var wishlist = await _wishlistService.GetWishlistAsync(User.GetUserId());
            return Ok(wishlist);
        }

        [HttpPost("items/{productId:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(WishlistDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AddToWishlist(int productId)
        {
            var wishlist = await _wishlistService.AddToWishlistAsync(User.GetUserId(), productId);
            return Ok(wishlist);
        }

        [HttpDelete("items/{wishlistItemId:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(WishlistDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveFromWishlist(int wishlistItemId)
        {
            var wishlist = await _wishlistService.RemoveFromWishlistAsync(User.GetUserId(), wishlistItemId);
            return Ok(wishlist);
        }

        [HttpDelete]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ClearWishlist()
        {
            await _wishlistService.ClearWishlistAsync(User.GetUserId());
            return NoContent();
        }
    }
}
