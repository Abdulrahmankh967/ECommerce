using _1_Repository.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace _3_RestfulAPI.Authorization
{
    public class CustomerOwnerOrAdminHandler
    : AuthorizationHandler<CustomerOwnerOrAdminRequirement, int>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context,CustomerOwnerOrAdminRequirement requirement,int CustomerId)
        {
           
            // Admin override
            if (context.User.IsInRole("admin"))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            // Ownership check
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (int.TryParse(userId, out int authenticatedCustomerId) && authenticatedCustomerId == CustomerId)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}


