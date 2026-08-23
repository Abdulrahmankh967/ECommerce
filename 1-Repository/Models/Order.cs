

namespace _1_Repository.Data
{
    public class Order
    {
        public int Id { get; set; }

        public DateTime OrderDate { get; set; }

        public decimal TotalPrice { get; set; }

        public int CustomerId { get; set; }

        public Customer Customer { get; set; } = null!;

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        public Payment? Payment { get; set; }
    }
}
