using System.ComponentModel.DataAnnotations;

public class CreateSupplierDto
{
    [Required(ErrorMessage = "Supplier name is required.")]
    [StringLength(150, ErrorMessage = "Supplier name cannot exceed 150 characters.")]
    public string Name { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "Invalid email format.")]
    [StringLength(150, ErrorMessage = "Email cannot exceed 150 characters.")]
    public string? Email { get; set; }

    [StringLength(50, ErrorMessage = "Phone number cannot exceed 50 characters.")]
    public string? Phone { get; set; }

    [StringLength(250, ErrorMessage = "Address cannot exceed 250 characters.")]
    public string? Address { get; set; }

    public bool IsActive { get; set; } = true;
}
