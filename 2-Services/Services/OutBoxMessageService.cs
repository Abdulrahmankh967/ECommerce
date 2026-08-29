public class OutBoxMessageService
{
    private readonly IOutBoxMessageRepository _outBoxMessageRepository;

    public OutBoxMessageService(IOutBoxMessageRepository outBoxMessageRepository)
    {
        _outBoxMessageRepository = outBoxMessageRepository;
    }

    public async Task<List<OutboxMessage>> GetPendingMessagesAsync()
    {
        return await _outBoxMessageRepository.GetPendingMessagesAsync();
    }

    public async Task AddOutBoxMessageAsync(OutboxMessage message)
    {
        if (message is null)
        {
            throw new ArgumentNullException(nameof(message));
        }

        await _outBoxMessageRepository.AddAsync(message);
    }

    
    public async Task CreateAndAddMessageAsync<T>(string type, T payload)
    {
        var message = new OutboxMessage
        {
            Type = type,
            Payload = System.Text.Json.JsonSerializer.Serialize(payload),
            CreatedAt = DateTime.UtcNow,
            IsProcessed = false
        };

        await _outBoxMessageRepository.AddAsync(message);
    }

    
    public async Task MarkAsProcessedAsync(int messageId)
    {
        var message = await _outBoxMessageRepository.GetByIdAsync(messageId);
        if (message != null)
        {
            message.IsProcessed = true;
            message.ProcessedAt = DateTime.UtcNow;
            message.Error = null;
            _outBoxMessageRepository.Update(message);
        }
    }

    
    public async Task MarkAsFailedAsync(int messageId, string errorReason)
    {
        var message = await _outBoxMessageRepository.GetByIdAsync(messageId);
        if (message != null)
        {
            message.Error = errorReason;
            _outBoxMessageRepository.Update(message);
        }
    }
}