using _2_Services.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using System.Threading.Tasks;


namespace _3_RestfulAPI.Controllers
{
    [Authorize] //This mean that all endpoints in this controller require the user to be authenticated. If a request is made without a valid JWT token, it will be rejected with a 401 Unauthorized response.
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly CustomerService _customerService;

        public CustomersController(CustomerService customerService)
        {
            _customerService = customerService;
        }


        [HttpGet("GetById/{id}")]
        [EnableRateLimiting("LowCostLimiter")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetCustomerById(int id, [FromServices] IAuthorizationService authorizationHandler)
        {
            if(id <= 0)
            {
                return BadRequest("Customer ID must be greater than zero.");
            }

            var customer = await _customerService.GetCustomerByIdAsync(id);

            if (customer == null)
            {
                return NotFound("Student Not Found");
            }

            var authResult= await authorizationHandler.AuthorizeAsync(User, id, "CustomerOwnerOrAdmin");


            if (!authResult.Succeeded)
                return Forbid(); 

            return Ok(customer);
        }


        
        [HttpGet("GetAll")]
        [EnableRateLimiting("HighCostLimiter")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _customerService.GetAllCustomersAsync();

            return Ok(customers);
        }


        [HttpGet("GetCustomerWithOrders/{Id}")]
        [EnableRateLimiting("LowCostLimiter")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetCustomerWithOrders(int customerId)
        {
            var customer = await _customerService.GetCustomerWithOrders(customerId);
            if (customer == null)
            {
                return NotFound();
            }
            return Ok(customer);
        }


        [HttpGet("GetCustomersByPage")]
        [EnableRateLimiting("HighCostLimiter")]
        [Authorize(Roles = "admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetCustomersByPage(int pageNumber, int pageSize)
        {
            var customers = await _customerService.GetCustomersByPage(pageNumber, pageSize);
            return Ok(customers);
        }


        [HttpPost("AddCustomer")]
        [Authorize(Roles = "admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> AddCustomer(CreateCustomerDto customerDto)
        {
            var createdCustomer =
                await _customerService.CreateCustomerAsync(customerDto);

            var response = new CreateCustomerResponseDto
            {
                Id = createdCustomer.Id,
                FullName = createdCustomer.FullName,
                Email = createdCustomer.Email,
                Phone = createdCustomer.Phone,
                Role = createdCustomer.Role
            };

            return CreatedAtAction(
                nameof(GetCustomerById),
                new { id = response.Id },response);
        }


    }
}
