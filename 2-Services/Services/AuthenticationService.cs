using _1_Repository.Data;
using _2_Services.Services;

public class AuthenticationService
{
    private readonly CustomerService _customerService;
    private readonly EmailVerificationService _emailVerificationService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthenticationService(CustomerService customerService,EmailVerificationService emailVerificationService,
                                 RefreshTokenService refreshTokenService,IPasswordHasher passwordHasher,ITokenService tokenService)
    {
        _customerService = customerService;

        _emailVerificationService = emailVerificationService;

        _refreshTokenService = refreshTokenService;

        _passwordHasher = passwordHasher;

        _tokenService = tokenService;

    }
    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var customer = await _customerService.GetCustomerByEmailAsync(request.Email);

        if (customer == null)
        {
            throw new UnauthorizedException("Invalid credentials.");
        }

        bool isPasswordValid = _passwordHasher.Verify(request.Password, customer.PasswordHash);

        if (!isPasswordValid)
            throw new UnauthorizedException("Invalid credentials.");

        var verification = await _emailVerificationService.CreateEmailVerificationAsync(customer.Id);

        return new LoginResponse
        {
            Message = "Login successful. Please check your email.",
            VerificationId = verification.VerificationId
        };
    }
    public async Task<VerifyOTPResponse> VerifyEmailAsync(VerifyOTPRequest request)
    {
        var verification = await _emailVerificationService.GetEmailVerificationByIdAsync(request.VerificationId);

        if (verification == null)
        {
            throw new BadRequestException("Invalid verification request.");
        }

        bool isCodeValid = await _emailVerificationService.VerifyCodeAsync(request.VerificationId, request.OTP);

        if (!isCodeValid)
        {
            throw new BadRequestException("Invalid or expired verification code.");
        }

        var customer = await _customerService.GetCustomerByIdAsync(verification.CustomerId);

        if (customer == null)
        {
            throw new NotFoundException("Customer not found.");
        }
        var accessToken =  _tokenService.GenerateAccessToken(new AccessTokenData
        {
            UserId = customer.Id,
            Email = customer.Email,
            Role = customer.Role
        });
        var refreshToken =  _tokenService.GenerateRefreshToken();

        await _refreshTokenService.AddRefreshTokenAsync(
             new RefreshTokenRequest
             {
                 RefreshToken = refreshToken
             }, customer.Id);


        return new VerifyOTPResponse
        {
            Message = "Email verified successfully.",
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
    }


    public async Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var storedToken = await _refreshTokenService.ValidateRefreshTokenAsync(request.RefreshToken);

        if (storedToken == null)
        {
            throw new UnauthorizedException("Invalid refresh token.");
        }

        var customer = await _customerService.GetCustomerAuthByIdAsync(storedToken.CustomerId);

        if (customer == null)
        {
            throw new UnauthorizedException("Customer not found.");
        }

        await _refreshTokenService.RevokeRefreshTokenAsync(request.RefreshToken);
        var newAccessToken = _tokenService.GenerateAccessToken(new AccessTokenData
        {
            UserId = customer.Id,
            Email = customer.Email,
            Role = customer.Role
        });
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        await _refreshTokenService.AddRefreshTokenAsync(
            new RefreshTokenRequest
            {
                RefreshToken = newRefreshToken
            }, customer.Id);

        return new RefreshTokenResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken
        };
    }
}