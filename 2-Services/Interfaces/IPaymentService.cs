namespace _2_Services.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentDto?> GetPaymentByIdAsync(int id);
        Task<PaymentDto?> GetPaymentByOrderIdAsync(int orderId);
    }
}
