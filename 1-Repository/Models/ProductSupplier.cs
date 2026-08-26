using _1_Repository.Data;

public class ProductSupplier
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public int SupplierId { get; set; }

    public string? SupplierProductCode { get; set; }

    public decimal CostPrice { get; set; }

    public int StockQuantity { get; set; }

    public bool IsActive { get; set; }

    public Product Product { get; set; } = null!;

    public Supplier Supplier { get; set; } = null!;
}