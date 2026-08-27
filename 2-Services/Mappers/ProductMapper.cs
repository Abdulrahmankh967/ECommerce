using _1_Repository.Data;

public class ProductMapper
{
    public static ProductDTO MapToDto(Product p, string categoryName = "") => new ProductDTO
    {
        Id = p.Id,
        Name = p.Name,
        Price = p.Price,
        Stock = p.Stock,
        IsActive = p.IsActive,
        ImageUrl = p.ImageUrl,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? categoryName
    };
}