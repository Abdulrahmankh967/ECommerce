using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;

public class OrderEmailBackgroundService : BackgroundService
{
    private readonly IOrderEmailQueue _queue;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OrderEmailBackgroundService> _logger;
    private readonly OutBoxMessageService _outBoxMessageService;

    public OrderEmailBackgroundService(
        IOrderEmailQueue queue,
        IServiceProvider serviceProvider,
        ILogger<OrderEmailBackgroundService> logger,
        OutBoxMessageService outBoxMessageService)
    {
        _queue = queue;
        _serviceProvider = serviceProvider;
        _logger = logger;
        _outBoxMessageService = outBoxMessageService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        
        await ProcessPendingOutboxMessagesAsync(stoppingToken);

        
        while (!stoppingToken.IsCancellationRequested)
        {
            var message = await _queue.DequeueAsync(stoppingToken);

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();
                var outboxService = scope.ServiceProvider.GetRequiredService<OutBoxMessageService>();

                await emailService.SendPlaceOrderMessage(
                    message.Email,
                    $"Your order with ID {message.OrderId} has been placed successfully."
                );

                
                await outboxService.MarkAsProcessedAsync(message.OrderId);

                _logger.LogInformation("Order email sent to {Email} for Order #{OrderId}", message.Email, message.OrderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send order email to {Email} for Order #{OrderId}", message.Email, message.OrderId);
            }
        }
    }

    private async Task ProcessPendingOutboxMessagesAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();

            var outboxService = scope.ServiceProvider.GetRequiredService<OutBoxMessageService>();
            var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

            var pendingMessages = await outboxService.GetPendingMessagesAsync();

            foreach (var message in pendingMessages)
            {
                if (stoppingToken.IsCancellationRequested) break;

                
                var emailData = JsonSerializer.Deserialize<OrderEmailMessage>(message.Payload);

                if (emailData is null) continue;

                try
                {
                    await emailService.SendPlaceOrderMessage(emailData.Email,$"Your order with ID {emailData.OrderId} has been placed successfully."
                    );

                    await outboxService.MarkAsProcessedAsync(message.Id);
                    _logger.LogInformation("[Recovery] Pending order email sent for Order #{OrderId}", emailData.OrderId);
                }
                catch (Exception ex)
                {
                    await outboxService.MarkAsFailedAsync(message.Id, ex.Message);
                    _logger.LogError(ex, "[Recovery] Failed to send pending email for Message {MessageId}", message.Id);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while processing pending Outbox messages.");
        }
    }
}