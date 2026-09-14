using _1_Repository.Data;

public class CategoryMapper
{
    public static CategoryDto MapToDto(Category c) => new CategoryDto
    {
        Id = c.Id,
        Name = c.Name,
        ParentCategoryId = c.ParentCategoryId,
        ProductCount = c.Products?.Count ?? 0,
        SubCategories = c.SubCategories?.Select(MapToDto).ToList() ?? new List<CategoryDto>()
    };

    public static List<CategoryDto> MapToDtoList(IEnumerable<Category> categories)
    {
        return categories.Select(MapToDto).ToList();
    }

    public static Category MapToEntity(CreateCategoryDto dto) => new Category
    {
        Name = dto.Name,
        ParentCategoryId = dto.ParentCategoryId
    };

    public static void UpdateEntity(Category category, CreateCategoryDto dto)
    {
        category.Name = dto.Name;
        category.ParentCategoryId = dto.ParentCategoryId;
    }
}
