using _2_Services.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace _3_RestfulAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly CustomerService _customerService;

        public CustomersController(CustomerService customerService)
        {
            _customerService = customerService;
        }


        //[HttpGet("GetCurrent")]
        //[EnableRateLimiting("LowCostLimiter")]
        //[ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status401Unauthorized)]
        //[ProducesResponseType(StatusCodes.Status404NotFound)]
        //public async Task<IActionResult> GetCurrentCustomer()
        //{
        //    var customer = await _customerService.GetCustomerByIdAsync(User.GetUserId());
        //    return Ok(customer);
        //}

        [HttpGet("GetById/{id:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCustomerById(
            int id,
            [FromServices] IAuthorizationService authorizationHandler)
        {
            var authResult = await authorizationHandler.AuthorizeAsync(User, id, "CustomerOwnerOrAdmin");
            if (!authResult.Succeeded)
                return Forbid();

            var customer = await _customerService.GetCustomerByIdAsync(id);
            return Ok(customer);
        }

        [HttpGet("GetAll")]
        [Authorize(Roles = "admin")]
        [EnableRateLimiting("HighCostLimiter")]
        [ProducesResponseType(typeof(List<CustomerDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _customerService.GetAllCustomersAsync();
            return Ok(customers);
        }

        [HttpGet("GetCustomerWithOrders/{customerId:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCustomerWithOrders(
            int customerId,
            [FromServices] IAuthorizationService authorizationHandler)
        {
            var authResult = await authorizationHandler.AuthorizeAsync(User, customerId, "CustomerOwnerOrAdmin");
            if (!authResult.Succeeded)
                return Forbid();

            var customer = await _customerService.GetCustomerWithOrders(customerId);
            return Ok(customer);
        }

        [HttpGet("GetCustomersByPage")]
        [Authorize(Roles = "admin")]
        [EnableRateLimiting("HighCostLimiter")]
        [ProducesResponseType(typeof(PagedResult<CustomerDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetCustomersByPage([FromQuery] int pageNumber, [FromQuery] int pageSize)
        {
            var customers = await _customerService.GetCustomersByPage(pageNumber, pageSize);
            return Ok(customers);
        }

        [HttpPost("AddCustomer")]
        [Authorize(Roles = "admin")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(typeof(CreateCustomerResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> AddCustomer(CreateCustomerDto customerDto)
        {
            var createdCustomer = await _customerService.CreateCustomerAsync(customerDto);

            return CreatedAtAction(
                nameof(GetCustomerById),
                new { id = createdCustomer.Id },
                createdCustomer);
        }

        [HttpPut]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCurrentCustomer(UpdateCustomerDto dto)
        {
            await _customerService.UpdateCustomerAsync(User.GetUserId(), dto);
            return NoContent();
        }

        [HttpPut("{id:int}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCustomer(
            int id,
            UpdateCustomerDto dto,
            [FromServices] IAuthorizationService authorizationHandler)
        {
            var authResult = await authorizationHandler.AuthorizeAsync(User, id, "CustomerOwnerOrAdmin");
            if (!authResult.Succeeded)
                return Forbid();

            await _customerService.UpdateCustomerAsync(id, dto);
            return NoContent();
        }

        [HttpPost("change-password")]
        [EnableRateLimiting("AuthLimiter")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            await _customerService.ChangePassword(User.GetUserId(), dto.NewPassword);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "admin")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            await _customerService.DeleteCustomer(id);
            return NoContent();
        }
    }
}
