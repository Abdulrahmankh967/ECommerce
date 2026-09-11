namespace _1_Repository.Data
{
    public class Customer : User
    {
        public ICollection<Order> Orders { get; set; } = new List<Order>();

        public Wishlist? Wishlist { get; set; }

        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        public ICollection<CouponUsage> CouponUsages { get; set; } = new List<CouponUsage>();

        public ICollection<CustomerAddress> CustomerAddresses { get; set; } = new List<CustomerAddress>();

        public Cart? Cart { get; set; }
    }
}
