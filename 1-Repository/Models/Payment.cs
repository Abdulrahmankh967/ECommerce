

namespace _1_Repository.Data
{
    public class Payment
    {
        public int Id { get; set; }

        public decimal Amount { get; set; }

        public DateTime PaymentDate { get; set; }

        public string Method { get; set; } = string.Empty;

        public int OrderId { get; set; }

        public Order Order { get; set; } = null!;
    }
}
