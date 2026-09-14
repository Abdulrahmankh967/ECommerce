namespace _2_Services.Interfaces
{
    public interface IEmailService
    {
        Task SendVerificationCodeAsync(string email, string code);
        Task SendPlaceOrderMessage(string email, string messageContent);
    }
}
