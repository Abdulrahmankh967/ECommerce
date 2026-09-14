public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? ParentCategoryId { get; set; }
    public int ProductCount { get; set; }
    public List<CategoryDto> SubCategories { get; set; } = new List<CategoryDto>();
}

