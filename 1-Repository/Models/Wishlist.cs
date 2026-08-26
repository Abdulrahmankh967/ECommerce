namespace _1_Repository.Data
{
    public class Wishlist
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }

        public DateTime CreatedAt { get; set; }

        public Customer Customer { get; set; } = null!;

        public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    }
}
