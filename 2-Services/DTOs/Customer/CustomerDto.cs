public class CustomerDto
{

    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public List<OrderDTO> Orders { get; set; } = new List<OrderDTO>();

}
