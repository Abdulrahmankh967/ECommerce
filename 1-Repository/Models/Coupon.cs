namespace _1_Repository.Data
{
    public class Coupon
    {
        public int Id { get; set; }

        public string Code { get; set; } = string.Empty;

        public int DiscountType { get; set; } 

        public decimal DiscountValue { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int? UsageLimit { get; set; }

        public int TimesUsed { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<CouponUsage> CouponUsages { get; set; } = new List<CouponUsage>();
    }
}
