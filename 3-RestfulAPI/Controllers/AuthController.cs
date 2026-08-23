using _2_Services.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;


namespace _3_RestfulAPI.Controllers
{
    // This controller is responsible for authentication-related actions,
    // such as logging in and issuing JWT tokens.
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly CustomerService _customerService;
        private readonly RefreshTokenService _refreshTokenService;
        private readonly EmailVerificationService _emailVerificationService;


        public AuthController(CustomerService customerService,RefreshTokenService refreshTokenService, EmailVerificationService emailVerificationService)
        {
            _customerService = customerService;
            _refreshTokenService = refreshTokenService;
            _emailVerificationService = emailVerificationService;
        }



        // This endpoint handles user login.
        // It verifies credentials and returns a JWT token if login succeeds.
        [HttpPost("login")]
        [EnableRateLimiting("AuthLimiter")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            // Step 1: Find the student by email from the in-memory data store.
            // Email acts as the unique login identifier.
            var customer = await _customerService.GetCustomerByEmailAsync(request.Email);


            // If no student is found with the given email,
            // return 401 Unauthorized without revealing which field was wrong.
            if (customer == null)
                return Unauthorized("Invalid credentials");

            // Step 2: Verify the provided password against the stored hash.
            // Argon2 handles hashing and salt internally.
            bool isValidPassword = await _customerService.VerifyPasswordAsync(request.Password, customer.PasswordHash);



            // If the password does not match the stored hash,
            // return 401 Unauthorized.
            if (!isValidPassword)
                return Unauthorized("Invalid credentials");



            // Step 3: Create claims that represent the authenticated user's identity.
            // These claims will be embedded inside the JWT.

            var verification= await _emailVerificationService.CreateEmailVerificationAsync(customer.Id);

            // Step 7: Return the serialized JWT token to the client.
            // The client will send this token with future requests.
            return Ok(new LoginResponse
            {
                Message = "Login successful. Please check your email.",
                VerificationId = verification.VerificationId
            });
        }
        [HttpPost("verify-email")]
        [EnableRateLimiting("AuthLimiter")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> VerifyEmail(VerifyOTPRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.VerificationId) || string.IsNullOrWhiteSpace(request.OTP))
            {
                return BadRequest("Verification ID and code are required.");
            }

            if (! await _emailVerificationService.VerifyCodeAsync(request.VerificationId, request.OTP))
            {
                return BadRequest("Invalid or expired verification code.");
            }

            var verification = await _emailVerificationService.GetEmailVerificationByIdAsync(request.VerificationId);

            if (verification == null)
            {
                return Unauthorized("Invalid verification ID.");
            }
            var customer = await _customerService.GetCustomerAuthByIdAsync(verification.CustomerId);

            if (customer == null) 
            { 
                return BadRequest("Customer not found.");
            }

            var token = GenerateAccessToken(customer);

            var refToken = GenerateRefreshToken();

            await _refreshTokenService.AddRefreshTokenAsync(
                new RefreshTokenRequest
                {
                    RefreshToken = refToken
                }, customer.Id);

            return Ok(new VerifyOTPResponse
            {
                AccessToken = token,
                RefreshToken = refToken,
                Message = "Email verified successfully."
            });
        }
        


        [HttpPost("refresh")]
        [EnableRateLimiting("AuthLimiter")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequest request)
        {
            // Step 1: Validate the incoming refresh token.
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                return BadRequest("Refresh token is required.");
            }
            // Step 2: Check if the refresh token exists and is valid.
            var storedToken = await _refreshTokenService.ValidateRefreshTokenAsync(request.RefreshToken);

            if (storedToken == null)
            {
                return Unauthorized("Invalid refresh token.");
            }

            
            var customer = await _customerService.GetCustomerAuthByIdAsync(storedToken.CustomerId);

            // Step 3: Revoke the old refresh token and issue a new one.

            if (customer == null)
            {
                return Unauthorized("Customer not found.");
            }

            await _refreshTokenService.RevokeRefreshTokenAsync(request.RefreshToken);

            // Step 4: Generate a new JWT and refresh token.
            var newAccessToken = GenerateAccessToken(customer);
            string newRefreshToken = GenerateRefreshToken();

            // Step 5: Store the new refresh token in the database.
            await _refreshTokenService.AddRefreshTokenAsync(new RefreshTokenRequest { RefreshToken = newRefreshToken }, customer.Id);

            // Step 6: Return the new tokens to the client.
            return Ok(new RefreshTokenResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }
        private string GenerateAccessToken(CustomerAuthDto customer)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier,customer.Id.ToString()),
                
                new Claim(ClaimTypes.Email,customer.Email),
                
                new Claim(ClaimTypes.Role,customer.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("THIS_IS_A_VERY_SECRET_KEY_123456"));

            var creds = new SigningCredentials(key,SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "CustomerApi",
                audience: "CustomerApiUsers",
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        private static string GenerateRefreshToken()
        {
            // RefreshToken = selector + "." + token

            var Selectorbytes = new byte[32];
            var SecretBytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(Selectorbytes);
            rng.GetBytes(SecretBytes);
            return Convert.ToBase64String(Selectorbytes)+'.'+Convert.ToBase64String(SecretBytes);
        }
    }
}
