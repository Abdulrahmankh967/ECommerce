

namespace _1_Repository.Data
{
    public class Product
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int Stock { get; set; }

        public int CategoryId { get; set; }

        public bool IsActive { get; set; } = true;

        public string? ImageUrl { get; set; }

        public Category Category { get; set; } = null!;

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();

        public ICollection<ProductSupplier> ProductSuppliers { get; set; } = new List<ProductSupplier>();

        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
