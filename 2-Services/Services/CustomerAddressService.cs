using _1_Repository.Data;
using _1_Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace _2_Services.Services
{
    public class CustomerAddressService
    {
        private readonly ICustomerAddressRepository _addressRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CustomerAddressService(ICustomerAddressRepository addressRepository, IUnitOfWork unitOfWork)
        {
            _addressRepository = addressRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<CustomerAddressDto>> GetAddressesByCustomerAsync(int customerId)
        {
            if (customerId <= 0)
            {
                throw new BadRequestException("Customer ID must be greater than zero.");
            }
            var addresses = await _addressRepository.GetByCustomerIdAsync(customerId);

            return addresses.Select(CustomerAddressMapper.MapToDto).ToList();
        }

        public async Task<CustomerAddressDto> GetAddressByIdAsync(int addressId,int customerId)
        {
            if (addressId <= 0)
                throw new BadRequestException("Address ID must be greater than zero.");

            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            var address = await _addressRepository.GetByIdAsync(addressId);

            if (address == null || address.CustomerId != customerId)
                throw new NotFoundException($"Address with ID {addressId} not found.");

            return CustomerAddressMapper.MapToDto(address);
        }

        public async Task<CustomerAddressDto> CreateAddressAsync(int customerId, CreateCustomerAddressDto dto)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            if (dto == null)
                throw new BadRequestException("Address data is required.");

            if (dto.IsDefault)
                await ClearDefaultFlagAsync(customerId);

            var address = new CustomerAddress
            {
                CustomerId = customerId,
                Title = dto.Title,
                RecipientName = dto.RecipientName,
                Phone = dto.Phone,
                City = dto.City,
                Street = dto.Street,
                BuildingNumber = dto.BuildingNumber,
                PostalCode = dto.PostalCode,
                IsDefault = dto.IsDefault
            };

            await _addressRepository.AddAsync(address);
            await _unitOfWork.SaveChangesAsync();

            return CustomerAddressMapper.MapToDto(address);
        }

        public async Task<CustomerAddressDto?> UpdateAddressAsync(int addressId, int customerId, UpdateCustomerAddressDto dto)
        {
            if (addressId <= 0)
                throw new BadRequestException("Address ID must be greater than zero.");

            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            if (dto == null)
                throw new BadRequestException("Address data is required.");

            var address = await _addressRepository.GetByIdAsync(addressId);
            if (address == null || address.CustomerId != customerId)
                throw new NotFoundException($"Address with ID {addressId} not found for this customer.");

            if (dto.IsDefault)
                await ClearDefaultFlagAsync(customerId);

            address.Title = dto.Title;
            address.RecipientName = dto.RecipientName;
            address.Phone = dto.Phone;
            address.City = dto.City;
            address.Street = dto.Street;
            address.BuildingNumber = dto.BuildingNumber;
            address.PostalCode = dto.PostalCode;
            address.IsDefault = dto.IsDefault;

            _addressRepository.Update(address);
            await _unitOfWork.SaveChangesAsync();

            return CustomerAddressMapper.MapToDto(address);
        }

        public async Task<bool> DeleteAddressAsync(int addressId, int customerId)
        {
            if (addressId <= 0)
                throw new BadRequestException("Address ID must be greater than zero.");

            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            var address = await _addressRepository.GetByIdAsync(addressId);
            if (address == null || address.CustomerId != customerId)
                throw new NotFoundException($"Address with ID {addressId} not found for this customer.");

            _addressRepository.Delete(address);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        private async Task ClearDefaultFlagAsync(int customerId)
        {
            var existingDefault = await _addressRepository.GetDefaultAddressAsync(customerId);
            if (existingDefault != null)
            {
                existingDefault.IsDefault = false;
                _addressRepository.Update(existingDefault);
            }
        }

    }
}
