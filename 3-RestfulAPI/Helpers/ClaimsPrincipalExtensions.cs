using System.Security.Claims;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userId, out var id))
            throw new UnauthorizedException("Invalid user identity.");

        return id;
    }

    public static bool IsAdmin(this ClaimsPrincipal user)
        => user.IsInRole(nameof(UserRole.admin));
}
