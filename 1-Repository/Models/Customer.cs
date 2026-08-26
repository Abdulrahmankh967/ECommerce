

namespace _1_Repository.Data
{
    public class Customer
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;


        public ICollection<Order> Orders { get; set; } = new List<Order>();

        public Wishlist? Wishlist { get; set; }

        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        public ICollection<CouponUsage> CouponUsages { get; set; } = new List<CouponUsage>();

        public ICollection<CustomerAddress> CustomerAddresses { get; set; } = new List<CustomerAddress>();

        public Cart? Cart { get; set; }
    }
}
