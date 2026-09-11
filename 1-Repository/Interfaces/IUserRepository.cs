using _1_Repository.Data;

namespace _1_Repository.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetUserByEmailAsync(string email);
        Task<bool> IsEmailRegisteredAsync(string email);
        Task<bool> IsAdminAsync(int userId);
        Task<bool> IsCustomerAsync(int userId);
        Task<Admin?> GetAdminByIdAsync(int adminId);
        Task AddAdminAsync(Admin admin);
    }
}
