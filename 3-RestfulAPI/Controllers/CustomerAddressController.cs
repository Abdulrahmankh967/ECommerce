using _2_Services.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace _3_RestfulAPI.Controllers
{
    [ApiController]
    [Route("api/customers/addresses")]
    [Authorize]
    public class CustomerAddressController : ControllerBase
    {
        private readonly CustomerAddressService _addressService;

        public CustomerAddressController(CustomerAddressService addressService)
        {
            _addressService = addressService;
        }

        [HttpGet]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(List<CustomerAddressDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAddresses()
        {
            var addresses = await _addressService.GetAddressesByCustomerAsync(User.GetUserId());
            return Ok(addresses);
        }

        [HttpGet("{addressId:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(CustomerAddressDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAddress(int addressId)
        {
            var address = await _addressService.GetAddressByIdAsync(addressId, User.GetUserId());
            return Ok(address);
        }

        [HttpPost]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(CustomerAddressDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateAddress([FromBody] CreateCustomerAddressDto dto)
        {
            var address = await _addressService.CreateAddressAsync(User.GetUserId(), dto);
            return CreatedAtAction(nameof(GetAddress), new { addressId = address.Id }, address);
        }

        [HttpPut("{addressId:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(CustomerAddressDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateAddress(int addressId, [FromBody] UpdateCustomerAddressDto dto)
        {
            var address = await _addressService.UpdateAddressAsync(addressId, User.GetUserId(), dto);
            return Ok(address);
        }

        [HttpDelete("{addressId:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteAddress(int addressId)
        {
            await _addressService.DeleteAddressAsync(addressId, User.GetUserId());
            return NoContent();
        }
    }
}
