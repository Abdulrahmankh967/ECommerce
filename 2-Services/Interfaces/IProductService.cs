using _2_Services.DTOs;

namespace _2_Services.Interfaces
{
    public interface IProductService
    {
        Task<List<ProductDTO>> GetAllProductsAsync();
        Task<ProductDTO?> GetProductByIdAsync(int id);
        Task<List<ProductDTO>> GetProductsByCategoryAsync(int categoryId);
        Task<ProductDTO> CreateProductAsync(CreateProductDto dto);
        Task<ProductDTO?> UpdateProductAsync(int id, UpdateProductDto dto);
        Task<bool> DeleteProductAsync(int id);
    }
}
