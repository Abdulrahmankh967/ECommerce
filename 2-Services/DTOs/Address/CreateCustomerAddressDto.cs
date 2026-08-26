using System.ComponentModel.DataAnnotations;

public class CreateCustomerAddressDto
{
    [Required(ErrorMessage = "Title is required (e.g. Home, Work).")]
    [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Recipient name is required.")]
    [StringLength(150, ErrorMessage = "Recipient name cannot exceed 150 characters.")]
    public string RecipientName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phone number is required.")]
    [Phone(ErrorMessage = "Invalid phone number format.")]
    [StringLength(50, ErrorMessage = "Phone number cannot exceed 50 characters.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "City is required.")]
    [StringLength(100, ErrorMessage = "City cannot exceed 100 characters.")]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "Street is required.")]
    [StringLength(200, ErrorMessage = "Street cannot exceed 200 characters.")]
    public string Street { get; set; } = string.Empty;

    [StringLength(50, ErrorMessage = "Building number cannot exceed 50 characters.")]
    public string? BuildingNumber { get; set; }

    [StringLength(20, ErrorMessage = "Postal code cannot exceed 20 characters.")]
    public string? PostalCode { get; set; }

    public bool IsDefault { get; set; }
}
