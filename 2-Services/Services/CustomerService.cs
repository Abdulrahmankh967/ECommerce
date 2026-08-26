using _1_Repository.Data;
using _1_Repository.Interfaces;
using System.Security.Cryptography;
using Konscious.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;
namespace _2_Services.Services
{
    public class CustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CustomerService> _logger;
        private readonly IPasswordHasher _passwordHasher;

        public CustomerService(ICustomerRepository customerRepository, IUnitOfWork unitOfWork,ILogger<CustomerService> logger,IPasswordHasher passwordHasher)
        {
            _customerRepository = customerRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _passwordHasher = passwordHasher;
        }

        

        public async Task<CustomerDto?> GetCustomerByIdAsync(int id)
        {

            _logger.LogDebug("Getting customer by ID {CustomerId}",id);

            if (id <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }

            var customer = await _customerRepository.GetByIdAsync(id);

            if (customer == null)
            {
                _logger.LogWarning("Customer not found with ID {CustomerId}",id);

                throw new NotFoundException($"Customer with ID {id} not found.");
            }

            _logger.LogDebug("Customer {CustomerId} retrieved successfully",id);

            return new CustomerDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                Email = customer.Email,
                Orders = customer.Orders.Select(o => new OrderDTO
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    TotalPrice = o.TotalPrice
                }).ToList()
            };
        }

        public async Task<CustomerAuthDto?> GetCustomerAuthByIdAsync(int id)
        {

            if (id <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }

            var customer = await _customerRepository.GetByIdAsync(id);

            if (customer == null)
            {
                throw new NotFoundException($"Customer with ID {id} not found.");
            }

            return new CustomerAuthDto
            {
                Id = customer.Id,
                Email = customer.Email,
                Role = customer.Role,
                PasswordHash = customer.PasswordHash
            };
        }


        public async Task<CreateCustomerResponseDto> CreateCustomerAsync(CreateCustomerDto customer)
        {
            _logger.LogInformation("Creating new customer with email {Email}",DataMasker.MaskEmail(customer.Email));


            if (!Enum.TryParse<UserRole>(customer.Role,true,out var role))
            {
                throw new BadRequestException("Invalid role.");
            }

            var existingCustomer = await _customerRepository.GetCustomerByEmailAsync(customer.Email);

            if (existingCustomer != null)
            {
                throw new ConflictException("A customer with this email already exists.");
            }

            var newCustomer = new Customer
            {
                FullName = customer.FullName,
                Email = customer.Email,
                Phone = customer.Phone,
                Role = role.ToString(),
                PasswordHash = _passwordHasher.Hash(customer.Password)
            };
            
            await _customerRepository.AddAsync(newCustomer);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Customer {CustomerId} created successfully with email {Email}",newCustomer.Id,DataMasker.MaskEmail(newCustomer.Email));

            

            return new CreateCustomerResponseDto {Id=newCustomer.Id,FullName=newCustomer.FullName,
                                                  Email=newCustomer.Email,Phone=newCustomer.Phone,
                                                  Role=newCustomer.Role };
        }
        public async Task<List<CustomerDto>> GetAllCustomersAsync()
        {

            _logger.LogDebug("Retrieving all customers");

            var customers = await _customerRepository.GetAllAsync();

            _logger.LogDebug("Retrieved {CustomerCount} customers",customers.Count);

            return customers.Select(c => new CustomerDto
            {
                Id = c.Id,
                FullName = c.FullName,
                Orders = c.Orders.Select(o => new OrderDTO
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    TotalPrice = o.TotalPrice
                }).ToList() 
            }).ToList();

        }
        public async Task<CustomerDto?> GetCustomerWithOrders(int customerid)
        {

            if (customerid <= 0)
            {
                throw new BadRequestException(
                    "Customer ID must be greater than zero.");
            }

            var customer =await _customerRepository.GetCustomerWithOrdersAsync(customerid);

            if (customer == null)
            {
                throw new NotFoundException($"Customer with ID {customerid} not found.");
            }

            return new CustomerDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                Orders = customer.Orders.Select(o => new OrderDTO
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    TotalPrice = o.TotalPrice,
                    OrderItems = o.OrderItems.Select(oi => new OrderItemDTO
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        ProductName = oi.Product?.Name ?? string.Empty,
                        Quantity = oi.Quantity,
                        Price = oi.UnitPrice
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<PagedResult<CustomerDto>> GetCustomersByPage(int pageNumber, int pageSize)
        {

            _logger.LogDebug("Retrieving customers for page {PageNumber} with page size {PageSize}",pageNumber,pageSize);

            if (pageNumber <= 0)
            {
                throw new BadRequestException(
                    "Page number must be greater than zero.");
            }

            if (pageSize <= 0)
            {
                throw new BadRequestException(
                    "Page size must be greater than zero.");
            }



            var customers = await _customerRepository.GetCustomersByPage(pageNumber, pageSize);
            var totalCount =await _customerRepository.GetTotalCustomerCount();

                
            List<CustomerDto> customerDtos = customers.Select(c => new CustomerDto
            {
                Id = c.Id,
                FullName = c.FullName,
                Orders = c.Orders.Select(o => new OrderDTO
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    TotalPrice = o.TotalPrice
                }).ToList()
            }).ToList();


            _logger.LogDebug("Retrieved {CustomerCount} customers for page {PageNumber}",customerDtos.Count,pageNumber);

            return new PagedResult<CustomerDto>
            {
                Items = customerDtos,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };

        }

        public async Task<CustomerAuthDto?> GetCustomerByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new BadRequestException("Email cannot be null or empty.");
            }
            var customer = await _customerRepository.GetCustomerByEmailAsync(email);
            
            return customer == null ? null : new CustomerAuthDto
            {
                Id = customer.Id,
                Email = customer.Email,
                Role = customer.Role,
                PasswordHash = customer.PasswordHash
            };
        }

        public async Task DeleteCustomer(int customerId)
        {
            if (customerId <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }
            var customer = _customerRepository.GetByIdAsync(customerId).Result;
            if (customer == null)
            {
                throw new NotFoundException($"Customer with ID {customerId} not found.");
            }
            _customerRepository.Delete(customer);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task ChangePassword(int customerId, string newPassword)
        {
            if (customerId <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }
            var customer = await _customerRepository.GetByIdAsync(customerId);
            if (customer == null)
            {
                throw new NotFoundException($"Customer with ID {customerId} not found.");
            }
            customer.PasswordHash = _passwordHasher.Hash(newPassword);
            _customerRepository.Update(customer);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task UpdateCustomerAsync(int customerId, UpdateCustomerDto dto)
        {
            if (customerId <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }
            var customer = await _customerRepository.GetByIdAsync(customerId);
            if (customer == null)
            {
                throw new NotFoundException($"Customer with ID {customerId} not found.");
            }
            customer.FullName = dto.FullName ?? customer.FullName;
            customer.Phone = dto.Phone ?? customer.Phone;
            customer.Email = dto.Email ?? customer.Email;
            _customerRepository.Update(customer);
            await _unitOfWork.SaveChangesAsync();
        }


      
    }
}
