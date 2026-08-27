using _1_Repository.Data;
using _1_Repository.Interfaces;
using System.Threading.Tasks;

namespace _2_Services.Services
{
    public class PaymentService
    {
        private readonly IPaymentRepository _paymentRepository;

        public PaymentService(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<PaymentDto?> GetPaymentByIdAsync(int id)
        {
            if (id <= 0)
                throw new BadRequestException("Payment ID must be greater than zero.");

            var payment = await _paymentRepository.GetByIdAsync(id);
            if (payment == null)
                throw new NotFoundException($"Payment with ID {id} not found.");

            return PaymentMapper.MapToDto(payment);
        }

        public async Task<PaymentDto?> GetPaymentByOrderIdAsync(int orderId)
        {
            if (orderId <= 0)
                throw new BadRequestException("Order ID must be greater than zero.");

            var payment = await _paymentRepository.GetByOrderIdAsync(orderId);
            if (payment == null)
                throw new NotFoundException($"Payment for Order ID {orderId} not found.");

            return PaymentMapper.MapToDto(payment);
        }

    }
}
