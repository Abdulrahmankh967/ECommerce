

using _1_Repository.Data;

public class OrderItemDTO
{
    public int Id { get; set; }
    public Product product{ get; set; } =null!;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
