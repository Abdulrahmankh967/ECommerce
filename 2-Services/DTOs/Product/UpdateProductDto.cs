using System.ComponentModel.DataAnnotations;

namespace _2_Services.DTOs
{
    public class UpdateProductDto
    {
        [Required(ErrorMessage = "Product name is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Product name must be between 2 and 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [Range(0.01, 100000.00, ErrorMessage = "Price must be greater than 0.")]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Stock cannot be negative.")]
        public int Stock { get; set; }

        public bool IsActive { get; set; }

        [Url(ErrorMessage = "Invalid image URL format.")]
        public string? ImageUrl { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Category ID must be a valid positive integer.")]
        public int CategoryId { get; set; }
    }
}
