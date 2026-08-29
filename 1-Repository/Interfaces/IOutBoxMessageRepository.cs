using _1_Repository.Interfaces;

public interface IOutBoxMessageRepository : IGenericRepository<OutboxMessage>
{
    Task<List<OutboxMessage>> GetPendingMessagesAsync();

}