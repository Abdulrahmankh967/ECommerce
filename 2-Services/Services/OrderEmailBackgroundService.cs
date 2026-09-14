using _2_Services.Interfaces;
using _2_Services.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace _2_Services.Services
{
    public class OrderEmailBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OrderEmailBackgroundService> _logger;
        

        public OrderEmailBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<OrderEmailBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            
            while (!stoppingToken.IsCancellationRequested)
            {
                await ProcessPendingOutboxMessagesAsync(stoppingToken);

                
                await Task.Delay(3000, stoppingToken);
            }
        }

        private async Task ProcessPendingOutboxMessagesAsync(CancellationToken stoppingToken)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();

                var outboxService = scope.ServiceProvider.GetRequiredService<IOutBoxMessageService>();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();


                var pendingMessages = await outboxService.GetPendingMessagesAsync();

                foreach (var message in pendingMessages)
                {
                    if (stoppingToken.IsCancellationRequested) break;

                    var emailData = JsonSerializer.Deserialize<OrderEmailMessage>(message.Payload);
                    if (emailData is null) continue;

                    var order = await orderService.GetOrderByIdForAdminAsync(emailData.OrderId);
                
                    try
                    {
                        if (order != null && order.Items != null)
                        {
                            
                            var itemNames = string.Join(", ", order.Items.Select(item => $"{item.ProductName} ({item.UnitPrice})"));

                            var messageBody = $"Your order #{order.Id} with items ({itemNames}) has been placed successfully.";

                            await emailService.SendPlaceOrderMessage(emailData.Email, messageBody);

                            await outboxService.MarkAsProcessedAsync(message.Id);
                            _logger.LogInformation("Outbox order email sent for Order #{OrderId}", order.Id);
                        }
                    }
                    catch (Exception ex)
                    {
                        await outboxService.MarkAsFailedAsync(message.Id, ex.Message);
                        _logger.LogError(ex, "Failed to send outbox email for Message {MessageId}", message.Id);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing pending Outbox messages.");
            }
        }
    }
}