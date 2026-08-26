public class OrderDTO
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalPrice { get; set; }
    public ICollection<OrderItemDTO> OrderItems { get; set; } = new List<OrderItemDTO>();
}
