using _2_Services.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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


        // GET: api/customers/me/addresses
        [HttpGet]
        [ProducesResponseType(typeof(List<CustomerAddressDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAddresses()
        {
            var customerId = User.GetUserId();

            var addresses = await _addressService.GetAddressesByCustomerAsync(customerId);

            return Ok(addresses);
        }


        // GET: api/customers/me/addresses/5
        [HttpGet("{addressId:int}")]
        [ProducesResponseType(typeof(CustomerAddressDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAddress(int addressId)
        {
            var customerId = User.GetUserId();

            var address = await _addressService.GetAddressByIdAsync(addressId,customerId);

            if (address == null)
                return NotFound();

            // If CustomerAddressDto exposes CustomerId,
            // ownership should be checked here.
            // Otherwise, better add a customer-scoped service method.

            return Ok(address);
        }


        // POST: api/customers/me/addresses
        [HttpPost]
        [ProducesResponseType(typeof(CustomerAddressDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateAddress([FromBody] CreateCustomerAddressDto dto)
        {
            var customerId = User.GetUserId();

            var address =await _addressService.CreateAddressAsync(customerId, dto);

            return CreatedAtAction(nameof(GetAddress),new { addressId = address.Id },address);
        }


        // PUT: api/customers/me/addresses/5
        [HttpPut("{addressId:int}")]
        [ProducesResponseType(typeof(CustomerAddressDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateAddress(int addressId,[FromBody] UpdateCustomerAddressDto dto)
        {
            var customerId = User.GetUserId();

            var address =await _addressService.UpdateAddressAsync(addressId,customerId,dto);

            return Ok(address);
        }


        // DELETE: api/customers/me/addresses/5
        [HttpDelete("{addressId:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteAddress(int addressId)
        {
            var customerId = User.GetUserId();

            await _addressService.DeleteAddressAsync(addressId,customerId);

            return NoContent();
        }


        
    }
}