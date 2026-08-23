using _1_Repository.Data;
using _1_Repository.Interfaces;
using System.Security.Cryptography;
using Konscious.Security.Cryptography;
using System.Text;
namespace _2_Services.Services
{
    public class CustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CustomerService(ICustomerRepository customerRepository, IUnitOfWork unitOfWork)
        {
            _customerRepository = customerRepository;
            _unitOfWork = unitOfWork;
        }

        

        public async Task<CustomerDto?> GetCustomerByIdAsync(int id)
        {
           
            if (id <= 0)
            {
                throw new ArgumentException("Customer ID must be greater than zero.", nameof(id));
            }

            var customer = await _customerRepository.GetByIdAsync(id);

            if (customer == null)
            {
                return null;
            }

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
                throw new ArgumentException("Customer ID must be greater than zero.", nameof(id));
            }

            var customer = await _customerRepository.GetByIdAsync(id);

            if (customer == null)
            {
                return null;
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
            CustomerValidator(customer);

            var newCustomer = new Customer
            {
                FullName = customer.FullName,
                Email = customer.Email,
                Phone = customer.Phone,
                Role = customer.Role,
                PasswordHash = HashPassword(customer.Password)
            };
            
            await _customerRepository.AddAsync(newCustomer);
            await _unitOfWork.SaveChangesAsync();
            return new CreateCustomerResponseDto {Id=newCustomer.Id,FullName=newCustomer.FullName,
                                                  Email=newCustomer.Email,Phone=newCustomer.Phone,
                                                  Role=newCustomer.Role };
        }
        public async Task<List<CustomerDto>> GetAllCustomersAsync()
        {
            
            var customers = await _customerRepository.GetAllAsync();

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
            var customer =await _customerRepository.GetCustomerWithOrdersAsync(customerid);
            if (customer == null)
            {
                return null;
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
                        Quantity = oi.Quantity,
                        Price=oi.UnitPrice
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<PagedResult<CustomerDto>> GetCustomersByPage(int pageNumber, int pageSize)
        {

            if (pageNumber <= 0 || pageSize<=0)
            {
                throw new ArgumentException("Page number must be greater than zero.", nameof(pageNumber));
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

            return new PagedResult<CustomerDto>
            {
                Items = customerDtos,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };

        }


        private string HashPassword(string password)
        {
            byte[] salt = RandomNumberGenerator.GetBytes(16);

            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);

            using var argon2 = new Argon2id(passwordBytes);

            argon2.Salt = salt;
            argon2.MemorySize = 32635;
            argon2.Iterations = 4;
            argon2.DegreeOfParallelism = 2;

            byte[] hash = argon2.GetBytes(32);

            return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
        }

        public async Task<CustomerAuthDto?> GetCustomerByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new ArgumentException("Email cannot be null or empty.", nameof(email));
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


        public async Task<bool> VerifyPasswordAsync(string password, string passwordhash)
        {
            
            var parts = passwordhash.Split('.');

            if (parts.Length != 2)
            {
                throw new InvalidOperationException("Stored password hash is in an invalid format.");
            }

            byte[] salt = Convert.FromBase64String(parts[0]);
            byte[] storedHash = Convert.FromBase64String(parts[1]);

            using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password));
            argon2.Salt = salt;
            argon2.MemorySize = 32635;
            argon2.Iterations = 4;
            argon2.DegreeOfParallelism = 2;
            byte[] computedHash = argon2.GetBytes(32);
            return CryptographicOperations.FixedTimeEquals(computedHash, storedHash);
        }


        private void CustomerValidator(CreateCustomerDto customer)
        {
            if (customer == null)
            {
                throw new ArgumentNullException(nameof(customer));
            }
            if (string.IsNullOrWhiteSpace(customer.FullName))
            {
                throw new ArgumentException("Customer full name cannot be null or empty.", nameof(customer.FullName));
            }
            if (string.IsNullOrWhiteSpace(customer.Email))
            {
                throw new ArgumentException("Customer email cannot be null or empty.", nameof(customer.Email));
            }
            if (string.IsNullOrWhiteSpace(customer.Phone))
            {
                throw new ArgumentException("Customer Phone cannot be null or empty.", nameof(customer.Phone));
            }
        }
    }
}
