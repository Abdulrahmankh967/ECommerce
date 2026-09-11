using _1_Repository.Data;
using _1_Repository.Interfaces;
using Microsoft.Extensions.Logging;

namespace _2_Services.Services
{
    public class AuthenticationService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly EmailVerificationService _emailVerificationService;
        private readonly RefreshTokenService _refreshTokenService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthenticationService> _logger;

        public AuthenticationService(
            IUserRepository userRepository,
            IUnitOfWork unitOfWork,
            EmailVerificationService emailVerificationService,
            RefreshTokenService refreshTokenService,
            IPasswordHasher passwordHasher,
            ITokenService tokenService,
            ILogger<AuthenticationService> logger)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
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

            var user = await _userRepository.GetUserByEmailAsync(request.Email);

            if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Login failed for email: {Email}", DataMasker.MaskEmail(request.Email));
                throw new UnauthorizedException("Invalid credentials.");
            }

            var verification = await _emailVerificationService.CreateEmailVerificationAsync(user.Id);

            _logger.LogInformation("Login successful for User ID {UserId}. Verification OTP sent.", user.Id);

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
            var user = await GetValidUserForAuthAsync(verification!.CustomerId);

            var (accessToken, refreshToken) = await GenerateAndSaveTokenPairAsync(user);

            _logger.LogInformation("Email verified successfully for User ID {UserId}", user.Id);

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

           
            _logger.LogDebug("Attempting to refresh access token.");

            var storedToken = await _refreshTokenService.ValidateRefreshTokenAsync(request.RefreshToken);
            if (storedToken is null)
            {
                _logger.LogWarning("Invalid or expired refresh token attempt.");
                throw new UnauthorizedException("Invalid refresh token.");
            }

            var user = await GetValidUserForAuthAsync(storedToken.CustomerId);

            await _refreshTokenService.RevokeRefreshTokenAsync(request.RefreshToken);
            var (newAccessToken, newRefreshToken) = await GenerateAndSaveTokenPairAsync(user);

            _logger.LogInformation("Tokens refreshed successfully for User ID {UserId}", user.Id);

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

        public async Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            ValidateRequestNotNull(request, "Forgot password request cannot be null.");

            _logger.LogInformation("Forgot password requested for email: {Email}", DataMasker.MaskEmail(request.Email));

            var user = await _userRepository.GetUserByEmailAsync(request.Email);
            if (user == null)
            {
                return new ForgotPasswordResponse
                {
                    Message = "If an account with that email exists, password reset instructions have been sent."
                };
            }

            var verification = await _emailVerificationService.CreateEmailVerificationAsync(user.Id);

            return new ForgotPasswordResponse
            {
                Message = "Password reset instructions have been sent to your email.",
                VerificationId = verification.VerificationId
            };
        }

        public async Task ResetPasswordAsync(ResetPasswordRequest request)
        {
            ValidateRequestNotNull(request, "Reset password request cannot be null.");

            _logger.LogInformation("Resetting password for VerificationId: {VerificationId}", request.VerificationId);

            await ValidateOtpCodeAsync(request.VerificationId, request.OTP);

            var verification = await _emailVerificationService.GetEmailVerificationByIdAsync(request.VerificationId);
            if (verification == null)
            {
                throw new BadRequestException("Invalid verification request.");
            }

            var user = await _userRepository.GetByIdAsync(verification.CustomerId);
            if (user == null)
            {
                throw new NotFoundException($"User with ID {verification.CustomerId} not found.");
            }

            user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
            _userRepository.Update(user);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Password reset successfully for User ID: {UserId}", verification.CustomerId);
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

        private async Task<User> GetValidUserForAuthAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user is null)
            {
                _logger.LogWarning("User ID {UserId} not found during authentication process.", userId);
                throw new UnauthorizedException("User not found.");
            }

            return user;
        }

        private async Task<(string AccessToken, string RefreshToken)> GenerateAndSaveTokenPairAsync(User user)
        {
            bool isAdmin = await _userRepository.IsAdminAsync(user.Id);
            string role = isAdmin ? "admin" : "customer";

            var accessToken = _tokenService.GenerateAccessToken(new AccessTokenData
            {
                UserId = user.Id,
                Email = user.Email,
                Role = role
            });

            var refreshToken = _tokenService.GenerateRefreshToken();

            await _refreshTokenService.AddRefreshTokenAsync(refreshToken, user.Id);

            return (accessToken, refreshToken);
        }
    }
}
