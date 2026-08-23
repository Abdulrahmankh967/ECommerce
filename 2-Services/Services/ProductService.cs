using _1_Repository.Interfaces;

public class ProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(IProductRepository ProductRepository, IUnitOfWork unitOfWork)
    {
        _productRepository = ProductRepository;
        _unitOfWork = unitOfWork;
    }

    //public async Task CreateCustomerAsync(CreateCustomerDto customer)
    //{
    //    CustomerValidator(customer);

    //    var newCustomer = new Customer
    //    {
    //        FullName = customer.FullName,
    //        Email = customer.Email,
    //        Phone = customer.Phone
    //    };

    //    await _productRepository.AddAsync(newCustomer);
    //    await _unitOfWork.SaveChangesAsync();
    //}
    public async Task<List<ProductDTO>> GetAllProductsAsync()
    {

        var products = await _productRepository.GetAllAsync();

        return products.Select(c => new ProductDTO
        {
            Id = c.Id,
            Name =c.Name,
            Price = c.Price
        }).ToList();

    }

    //private void CustomerValidator(CreateCustomerDto customer)
    //{
    //    if (customer == null)
    //    {
    //        throw new ArgumentNullException(nameof(customer));
    //    }
    //    if (string.IsNullOrWhiteSpace(customer.FullName))
    //    {
    //        throw new ArgumentException("Customer full name cannot be null or empty.", nameof(customer.FullName));
    //    }
    //    if (string.IsNullOrWhiteSpace(customer.Email))
    //    {
    //        throw new ArgumentException("Customer email cannot be null or empty.", nameof(customer.Email));
    //    }
    //    if (string.IsNullOrWhiteSpace(customer.Phone))
    //    {
    //        throw new ArgumentException("Customer Phone cannot be null or empty.", nameof(customer.Phone));
    //    }
    //}
}

