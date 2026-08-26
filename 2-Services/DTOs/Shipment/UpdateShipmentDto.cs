using System;
using System.ComponentModel.DataAnnotations;

public class UpdateShipmentDto
{
    [Required(ErrorMessage = "Status is required.")]
    [StringLength(50, ErrorMessage = "Status cannot exceed 50 characters.")]
    public string Status { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "Tracking number cannot exceed 100 characters.")]
    public string? TrackingNumber { get; set; }

    [StringLength(100, ErrorMessage = "Carrier cannot exceed 100 characters.")]
    public string? Carrier { get; set; }

    public DateTime? ShipmentDate { get; set; }
    public DateTime? EstimatedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
}
