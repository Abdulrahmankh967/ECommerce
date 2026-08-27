using _1_Repository.Data;

namespace _1_Repository.Interfaces
{
    public interface IProductRepository : IGenericRepository<Product>
    {
        Task<List<Product>> GetProductsByCategory(int categoryId);

        Task<List<Product>> GetProductsByIdsAsync(List<int> productIds);

        Task<bool> UpdateStocksAsync(Dictionary<int, int> productQuantities);
    }

}
