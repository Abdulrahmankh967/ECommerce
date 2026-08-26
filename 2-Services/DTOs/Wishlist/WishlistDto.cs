using System.Collections.Generic;

public class WishlistDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public List<WishlistItemDto> Items { get; set; } = new List<WishlistItemDto>();
}
