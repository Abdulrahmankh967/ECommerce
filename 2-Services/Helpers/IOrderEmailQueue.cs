public interface IOrderEmailQueue
{
    ValueTask EnqueueAsync(OrderEmailMessage message);

    ValueTask<OrderEmailMessage> DequeueAsync(CancellationToken cancellationToken);
}