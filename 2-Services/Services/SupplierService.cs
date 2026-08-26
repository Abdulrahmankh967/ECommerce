using _1_Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace _2_Services.Services
{
    public class SupplierService
    {
        private readonly ISupplierRepository _supplierRepository;
        private readonly IUnitOfWork _unitOfWork;

        public SupplierService(ISupplierRepository supplierRepository, IUnitOfWork unitOfWork)
        {
            _supplierRepository = supplierRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<SupplierDto>> GetAllSuppliersAsync()
        {
            var suppliers = await _supplierRepository.GetAllAsync();
            return suppliers.Select(MapToDto).ToList();
        }

        public async Task<List<SupplierDto>> GetActiveSuppliersAsync()
        {
            var suppliers = await _supplierRepository.GetActiveSuppliersAsync();
            return suppliers.Select(MapToDto).ToList();
        }

        public async Task<SupplierDto?> GetSupplierByIdAsync(int id)
        {
            if (id <= 0)
                throw new BadRequestException("Supplier ID must be greater than zero.");

            var supplier = await _supplierRepository.GetByIdAsync(id);
            if (supplier == null)
                throw new NotFoundException($"Supplier with ID {id} not found.");

            return MapToDto(supplier);
        }

        public async Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto dto)
        {
            if (dto == null)
                throw new BadRequestException("Supplier data is required.");

            var supplier = new Supplier
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            await _supplierRepository.AddAsync(supplier);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(supplier);
        }

        public async Task<SupplierDto?> UpdateSupplierAsync(int id, CreateSupplierDto dto)
        {
            if (id <= 0)
                throw new BadRequestException("Supplier ID must be greater than zero.");

            if (dto == null)
                throw new BadRequestException("Supplier data is required.");

            var supplier = await _supplierRepository.GetByIdAsync(id);
            if (supplier == null)
                throw new NotFoundException($"Supplier with ID {id} not found.");

            supplier.Name = dto.Name;
            supplier.Email = dto.Email;
            supplier.Phone = dto.Phone;
            supplier.Address = dto.Address;
            supplier.IsActive = dto.IsActive;

            _supplierRepository.Update(supplier);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(supplier);
        }

        public async Task<bool> DeleteSupplierAsync(int id)
        {
            if (id <= 0)
                throw new BadRequestException("Supplier ID must be greater than zero.");

            var supplier = await _supplierRepository.GetByIdAsync(id);
            if (supplier == null)
                throw new NotFoundException($"Supplier with ID {id} not found.");

            _supplierRepository.Delete(supplier);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        private static SupplierDto MapToDto(Supplier s) => new SupplierDto
        {
            Id = s.Id,
            Name = s.Name,
            Email = s.Email,
            Phone = s.Phone,
            Address = s.Address,
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt
        };
    }
}
