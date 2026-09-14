using _1_Repository.Data;
using _1_Repository.Interfaces;
using _2_Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace _2_Services.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CustomerService> _logger;
        private readonly IPasswordHasher _passwordHasher;

        public CustomerService(
            ICustomerRepository customerRepository,
            IUserRepository userRepository,
            IUnitOfWork unitOfWork,
            ILogger<CustomerService> logger,
            IPasswordHasher passwordHasher)
        {
            _customerRepository = customerRepository;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _passwordHasher = passwordHasher;
        }

        public async Task<CustomerDto?> GetCustomerByIdAsync(int id)
        {
            _logger.LogDebug("Getting customer by ID {CustomerId}", id);

            if (id <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }

            var isAdmin = await _userRepository.IsAdminAsync(id);
            var role = isAdmin ? "admin" : "customer";

            var customer = await _customerRepository.GetByIdAsync(id);

            if (customer is not null)
            {
                _logger.LogDebug("Customer {CustomerId} retrieved successfully", id);
                return CustomerMapper.MapToCustomerDto(customer, role);
            }

            // If not found in Customers, check if user is an Admin
            var user = await _userRepository.GetByIdAsync(id);
            if (user is not null && isAdmin)
            {
                _logger.LogDebug("Admin {AdminId} retrieved successfully as user", id);
                return CustomerMapper.MapUserToCustomerDto(user, "admin");
            }

            _logger.LogWarning("Customer or Admin not found with ID {CustomerId}", id);
            throw new NotFoundException($"Customer with ID {id} not found.");
        }

        public async Task<CustomerAuthDto?> GetCustomerAuthByIdAsync(int id)
        {
            if (id <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }

            var isAdmin = await _userRepository.IsAdminAsync(id);
            var role = isAdmin ? "admin" : "customer";

            var customer = await _customerRepository.GetByIdAsync(id);

            if (customer is not null)
            {
                return CustomerMapper.MapToAuthDto(customer, role);
            }

            var user = await _userRepository.GetByIdAsync(id);
            if (user is not null && isAdmin)
            {
                return new CustomerAuthDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = "admin",
                    PasswordHash = user.PasswordHash
                };
            }

            throw new NotFoundException($"Customer with ID {id} not found.");
        }

        public async Task<CreateCustomerResponseDto> CreateCustomerAsync(CreateCustomerDto customer)
        {
            _logger.LogInformation("Creating new customer with email {Email}", DataMasker.MaskEmail(customer.Email));

            var isRegistered = await _userRepository.IsEmailRegisteredAsync(customer.Email);

            if (isRegistered)
            {
                throw new ConflictException("A customer with this email already exists.");
            }

            var newCustomer = new Customer
            {
                FullName = customer.FullName,
                Email = customer.Email,
                Phone = customer.Phone,
                PasswordHash = _passwordHasher.Hash(customer.Password)
            };

            await _customerRepository.AddAsync(newCustomer);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Customer {CustomerId} created successfully with email {Email}", newCustomer.Id, DataMasker.MaskEmail(newCustomer.Email));

            return CustomerMapper.MapToCreateCustomerDto(newCustomer, "customer");
        }

        public async Task<List<CustomerDto>> GetAllCustomersAsync()
        {
            _logger.LogDebug("Retrieving all customers");

            var customers = await _customerRepository.GetAllAsync();

            _logger.LogDebug("Retrieved {CustomerCount} customers", customers.Count);

            return customers.Select(c => CustomerMapper.MapToCustomerDto(c, "customer")).ToList();
        }

        public async Task<CustomerDto?> GetCustomerWithOrdersAsync(int customerid)
        {
            if (customerid <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }

            var customer = await _customerRepository.GetCustomerWithOrdersAsync(customerid);

            if (customer is null)
            {
                throw new NotFoundException($"Customer with ID {customerid} not found.");
            }

            var isAdmin = await _userRepository.IsAdminAsync(customerid);
            var role = isAdmin ? "admin" : "customer";

            return CustomerMapper.MapToCustomerDto(customer, role);
        }

        public async Task<PagedResult<CustomerDto>> GetCustomersByPageAsync(int pageNumber, int pageSize)
        {
            _logger.LogDebug("Retrieving customers for page {PageNumber} with page size {PageSize}", pageNumber, pageSize);

            if (pageNumber <= 0)
            {
                throw new BadRequestException("Page number must be greater than zero.");
            }

            if (pageSize <= 0)
            {
                throw new BadRequestException("Page size must be greater than zero.");
            }

            var customers = await _customerRepository.GetCustomersByPage(pageNumber, pageSize);
            var totalCount = await _customerRepository.GetTotalCustomerCount();

            List<CustomerDto> customerDtos = customers.Select(c => CustomerMapper.MapToCustomerDto(c, "customer")).ToList();

            _logger.LogDebug("Retrieved {CustomerCount} customers for page {PageNumber}", customerDtos.Count, pageNumber);

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

            return customer is null ? null : CustomerMapper.MapToAuthDto(customer, "customer");
        }

        public async Task DeleteCustomerAsync(int customerId)
        {
            if (customerId <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }

            var customer = await _customerRepository.GetByIdAsync(customerId);

            if (customer is null)
            {
                throw new NotFoundException($"Customer with ID {customerId} not found.");
            }

            _customerRepository.Delete(customer);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task ChangePasswordAsync(int customerId, string newPassword)
        {
            if (customerId <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }

            if (string.IsNullOrWhiteSpace(newPassword))
            {
                throw new BadRequestException("New password cannot be empty.");
            }

            var user = await _userRepository.GetByIdAsync(customerId);

            if (user is null)
            {
                throw new NotFoundException($"User with ID {customerId} not found.");
            }

            user.PasswordHash = _passwordHasher.Hash(newPassword);
            _userRepository.Update(user);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task UpdateCustomerAsync(int customerId, UpdateCustomerDto dto)
        {
            Customer customer = await ValidateUpdateCustomerDto(customerId, dto);

            customer.FullName = dto.FullName ?? customer.FullName;
            customer.Phone = dto.Phone ?? customer.Phone;
            customer.Email = dto.Email ?? customer.Email;
            _customerRepository.Update(customer);
            await _unitOfWork.SaveChangesAsync();
        }
        
        private async Task<Customer> ValidateUpdateCustomerDto(int customerId, UpdateCustomerDto dto)
        {
            if (customerId <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }
            var customer = await _customerRepository.GetByIdAsync(customerId);

            if (customer is null)
            {
                throw new NotFoundException($"Customer with ID {customerId} not found.");
            }

            if (!string.IsNullOrWhiteSpace(dto.Email) && !string.Equals(dto.Email, customer.Email, StringComparison.OrdinalIgnoreCase))
            {
                if (await _userRepository.IsEmailRegisteredAsync(dto.Email))
                {
                    throw new ConflictException("A customer with this email already exists.");
                }
            }

            return customer;
        }

        public async Task<bool> IsEmailRegisteredAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new BadRequestException("Email cannot be null or empty.");
            }
            return await _userRepository.IsEmailRegisteredAsync(email);
        }
    }
}
