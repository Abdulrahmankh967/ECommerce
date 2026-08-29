using _1_Repository.Data;
using _2_Services.Services;
using Microsoft.Extensions.Logging;

namespace _2_Services.Services
{
    public class AuthenticationService
    {
        private readonly CustomerService _customerService;
        private readonly EmailVerificationService _emailVerificationService;
        private readonly RefreshTokenService _refreshTokenService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthenticationService> _logger;

        public AuthenticationService(
            CustomerService customerService,
            EmailVerificationService emailVerificationService,
            RefreshTokenService refreshTokenService,
            IPasswordHasher passwordHasher,
            ITokenService tokenService,
            ILogger<AuthenticationService> logger)
        {
            _customerService = customerService;
            _emailVerificationService = emailVerificationService;
            _refreshTokenService = refreshTokenService;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
            _logger = logger;
        }


        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            ValidateRequestNotNull(request, "Login request cannot be null.");

            _logger.LogInformation("Login attempt for email: {Email}", DataMasker.MaskEmail(request.Email));

            var customer = await _customerService.GetCustomerByEmailAsync(request.Email);

            
            if (customer is null || !_passwordHasher.Verify(request.Password, customer.PasswordHash))
            {
                _logger.LogWarning("Login failed for email: {Email}", DataMasker.MaskEmail(request.Email));
                throw new UnauthorizedException("Invalid credentials.");
            }

            var verification = await _emailVerificationService.CreateEmailVerificationAsync(customer.Id);

            _logger.LogInformation("Login successful for Customer ID {CustomerId}. Verification OTP sent.", customer.Id);

            return new LoginResponse
            {
                Message = "Login successful. Please check your email.",
                VerificationId = verification.VerificationId
            };
        }

        public async Task<VerifyOTPResponse> VerifyEmailAsync(VerifyOTPRequest request)
        {
            ValidateRequestNotNull(request, "Verification request cannot be null.");

            _logger.LogInformation("Verifying OTP for VerificationId: {VerificationId}", request.VerificationId);

            await ValidateOtpCodeAsync(request.VerificationId, request.OTP);

            var verification = await _emailVerificationService.GetEmailVerificationByIdAsync(request.VerificationId);
            var customer = await GetValidCustomerForAuthAsync(verification!.CustomerId);


            var (accessToken, refreshToken) = await GenerateAndSaveTokenPairAsync(customer);

            _logger.LogInformation("Email verified successfully for Customer ID {CustomerId}", customer.Id);

            return new VerifyOTPResponse
            {
                Message = "Email verified successfully.",
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };
        }

        public async Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            ValidateRequestNotNull(request, "Refresh token request cannot be null.");

            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                throw new BadRequestException("Refresh token cannot be empty.");
            }

            _logger.LogDebug("Attempting to refresh access token.");

            var storedToken = await _refreshTokenService.ValidateRefreshTokenAsync(request.RefreshToken);
            if (storedToken is null)
            {
                _logger.LogWarning("Invalid or expired refresh token attempt.");
                throw new UnauthorizedException("Invalid refresh token.");
            }

            var customer = await GetValidCustomerForAuthAsync(storedToken.CustomerId);

            await _refreshTokenService.RevokeRefreshTokenAsync(request.RefreshToken);
            var (newAccessToken, newRefreshToken) = await GenerateAndSaveTokenPairAsync(customer);

            _logger.LogInformation("Tokens refreshed successfully for Customer ID {CustomerId}", customer.Id);

            return new RefreshTokenResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            };
        }

        public async Task LogoutAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                throw new BadRequestException("Refresh token cannot be empty.");
            }

            await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken);
            _logger.LogInformation("Refresh token revoked successfully during logout.");
        }


        private static void ValidateRequestNotNull<T>(T request, string errorMessage)
        {
            if (request is null)
            {
                throw new BadRequestException(errorMessage);
            }
        }

        private async Task ValidateOtpCodeAsync(string verificationId, string otp)
        {
            var verification = await _emailVerificationService.GetEmailVerificationByIdAsync(verificationId);
            if (verification is null)
            {
                throw new BadRequestException("Invalid verification request.");
            }

            bool isCodeValid = await _emailVerificationService.VerifyCodeAsync(verificationId, otp);
            if (!isCodeValid)
            {
                _logger.LogWarning("Invalid or expired OTP attempt for VerificationId {VerificationId}", verificationId);
                throw new BadRequestException("Invalid or expired verification code.");
            }
        }

        private async Task<CustomerAuthDto> GetValidCustomerForAuthAsync(int customerId)
        {
            var customer = await _customerService.GetCustomerAuthByIdAsync(customerId);
            if (customer is null)
            {
                _logger.LogWarning("Customer ID {CustomerId} not found during authentication process.", customerId);
                throw new UnauthorizedException("Customer not found.");
            }

            return customer;
        }

        private async Task<(string AccessToken, string RefreshToken)> GenerateAndSaveTokenPairAsync(CustomerAuthDto customer)
        {
            var accessToken = _tokenService.GenerateAccessToken(new AccessTokenData
            {
                UserId = customer.Id,
                Email = customer.Email,
                Role = customer.Role
            });

            var refreshToken = _tokenService.GenerateRefreshToken();

            await _refreshTokenService.AddRefreshTokenAsync(refreshToken,customer.Id);

            return (accessToken, refreshToken);
        }
    }

}
