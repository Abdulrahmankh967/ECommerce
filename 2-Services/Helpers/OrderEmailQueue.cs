using System.Threading.Channels;

public class OrderEmailQueue : IOrderEmailQueue
{
    private readonly Channel<OrderEmailMessage> _queue = Channel.CreateUnbounded<OrderEmailMessage>();

    public async ValueTask EnqueueAsync(OrderEmailMessage message) => await _queue.Writer.WriteAsync(message);

    public async ValueTask<OrderEmailMessage> DequeueAsync(CancellationToken cancellationToken) => await _queue.Reader.ReadAsync(cancellationToken);
    
}

public record OrderEmailMessage(int OrderId,string Email);