public class OrderDetailDto
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalPrice { get; set; }
    public int CustomerId { get; set; }
    public string? PaymentMethod { get; set; }
    public string? ShipmentStatus { get; set; }
    public string? CouponCode { get; set; }
    public List<OrderItemDetailDto> Items { get; set; } = new List<OrderItemDetailDto>();
}
