using _1_Repository.Data;
using _1_Repository.Interfaces;
using Microsoft.Extensions.Logging;

namespace _2_Services.Services
{
    public class CustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CustomerService> _logger;
        private readonly IPasswordHasher _passwordHasher;

        public CustomerService(ICustomerRepository customerRepository, IUnitOfWork unitOfWork, ILogger<CustomerService> logger, IPasswordHasher passwordHasher)
        {
            _customerRepository = customerRepository;
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

            var customer = await _customerRepository.GetByIdAsync(id);

            if (customer is null)
            {
                _logger.LogWarning("Customer not found with ID {CustomerId}", id);

                throw new NotFoundException($"Customer with ID {id} not found.");
            }

            _logger.LogDebug("Customer {CustomerId} retrieved successfully", id);

            return CustomerMapper.MapToCustomerDto(customer);
        }

        public async Task<CustomerAuthDto?> GetCustomerAuthByIdAsync(int id)
        {

            if (id <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }

            var customer = await _customerRepository.GetByIdAsync(id);

            if (customer is null)
            {
                throw new NotFoundException($"Customer with ID {id} not found.");
            }

            return CustomerMapper.MapToAuthDto(customer);
        }

        public async Task<CreateCustomerResponseDto> CreateCustomerAsync(CreateCustomerDto customer)
        {
            _logger.LogInformation("Creating new customer with email {Email}", DataMasker.MaskEmail(customer.Email));


            if (!Enum.TryParse<UserRole>(customer.Role, true, out var role))
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
                Role = role.ToString() ,
                PasswordHash = _passwordHasher.Hash(customer.Password)
            };

            await _customerRepository.AddAsync(newCustomer);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Customer {CustomerId} created successfully with email {Email}", newCustomer.Id, DataMasker.MaskEmail(newCustomer.Email));


            return CustomerMapper.MapToCreateCustomerDto(newCustomer);
        }

        public async Task<List<CustomerDto>> GetAllCustomersAsync()
        {

            _logger.LogDebug("Retrieving all customers");

            var customers = await _customerRepository.GetAllAsync();

            _logger.LogDebug("Retrieved {CustomerCount} customers", customers.Count);

            return customers.Select(c => CustomerMapper.MapToCustomerDto(c))
                .ToList();

        }

        public async Task<CustomerDto?> GetCustomerWithOrdersAsync(int customerid)
        {

            if (customerid <= 0)
            {
                throw new BadRequestException(
                    "Customer ID must be greater than zero.");
            }

            var customer = await _customerRepository.GetCustomerWithOrdersAsync(customerid);

            if (customer is null)
            {
                throw new NotFoundException($"Customer with ID {customerid} not found.");
            }

            return CustomerMapper.MapToCustomerDto(customer);
        }

        public async Task<PagedResult<CustomerDto>> GetCustomersByPageAsync(int pageNumber, int pageSize)
        {

            _logger.LogDebug("Retrieving customers for page {PageNumber} with page size {PageSize}", pageNumber, pageSize);

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
            var totalCount = await _customerRepository.GetTotalCustomerCount();


            List<CustomerDto> customerDtos = customers.Select(c => CustomerMapper.MapToCustomerDto(c))
                .ToList();


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

            return customer is null ? null : CustomerMapper.MapToAuthDto(customer);
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

            var customer = await _customerRepository.GetByIdAsync(customerId);

            if (customer is null)
            {
                throw new NotFoundException($"Customer with ID {customerId} not found.");
            }

            customer.PasswordHash = _passwordHasher.Hash(newPassword);
            _customerRepository.Update(customer);
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
                if (await _customerRepository.IsEmailRegistered(dto.Email))
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
            return await _customerRepository.IsEmailRegistered(email);
        }
    }
}
