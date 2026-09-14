using _1_Repository.Data;

namespace _2_Services.Interfaces
{
    public interface IOutBoxMessageService
    {
        Task<List<OutboxMessage>> GetPendingMessagesAsync();
        Task AddOutBoxMessageAsync(OutboxMessage message);
        Task CreateAndAddMessageAsync<T>(string type, T payload);
        Task MarkAsProcessedAsync(int messageId);
        Task MarkAsFailedAsync(int messageId, string errorReason);
    }
}
