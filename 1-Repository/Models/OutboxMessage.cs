public class OutboxMessage
{
    public int Id { get; set; }
    public string Type { get; set; } = default!;      //  ex: OrderEmail/ver code
    public string Payload { get; set; } = default!;   // JSON Contaion (Email, OrderId.....)
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? Error { get; set; }
    public bool IsProcessed { get; set; }  
}
