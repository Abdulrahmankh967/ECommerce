using _1_Repository.Data;

public class PaymentMapper
{
    public static PaymentDto MapToDto(Payment p) => new PaymentDto
    {
        Id = p.Id,
        Amount = p.Amount,
        PaymentDate = p.PaymentDate,
        Method = p.Method,
        OrderId = p.OrderId
    };
}