namespace _1_Repository.Data
{
    public class CouponUsage
    {
        public int Id { get; set; }

        public int CouponId { get; set; }

        public Coupon Coupon { get; set; } = null!;

        public int CustomerId { get; set; }

        public Customer Customer { get; set; } = null!;

        public int OrderId { get; set; }

        public Order Order { get; set; } = null!;

        public DateTime UsedAt { get; set; } = DateTime.UtcNow;
    }
}
