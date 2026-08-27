using _1_Repository.Data;
using _1_Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace _2_Services.Services
{
    public class CouponService
    {
        private readonly ICouponRepository _couponRepository;
        private readonly ICouponUsageRepository _couponUsageRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CouponService(
            ICouponRepository couponRepository,
            ICouponUsageRepository couponUsageRepository,
            IUnitOfWork unitOfWork)
        {
            _couponRepository = couponRepository;
            _couponUsageRepository = couponUsageRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<CouponDto>> GetAllCouponsAsync()
        {
            var coupons = await _couponRepository.GetAllAsync();
            return coupons.Select(CouponMapper.MapToDto).ToList();
        }

        public async Task<CouponDto?> GetCouponByIdAsync(int id)
        {
            if (id <= 0)
                throw new BadRequestException("Coupon ID must be greater than zero.");

            var coupon = await _couponRepository.GetByIdAsync(id);
            if (coupon == null)
                throw new NotFoundException($"Coupon with ID {id} not found.");

            return CouponMapper.MapToDto(coupon);
        }

        public async Task<CouponDto?> GetCouponByCodeAsync(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new BadRequestException("Coupon code cannot be empty.");

            var coupon = await _couponRepository.GetByCodeAsync(code);
            return coupon == null ? null : CouponMapper.MapToDto(coupon);
        }

        public async Task<CouponDto> CreateCouponAsync(CreateCouponDto dto)
        {
            if (dto == null)
                throw new BadRequestException("Coupon data is required.");

            var existing = await _couponRepository.GetByCodeAsync(dto.Code);
            if (existing != null)
                throw new ConflictException($"A coupon with code '{dto.Code}' already exists.");

            var coupon = new Coupon
            {
                Code = dto.Code.ToUpperInvariant(),
                DiscountType = dto.DiscountType,
                DiscountValue = dto.DiscountValue,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                UsageLimit = dto.UsageLimit,
                TimesUsed = 0,
                IsActive = dto.IsActive
            };

            await _couponRepository.AddAsync(coupon);
            await _unitOfWork.SaveChangesAsync();

            return CouponMapper.MapToDto(coupon);
        }

        public async Task<CouponDto?> UpdateCouponAsync(int id, CreateCouponDto dto)
        {
            if (id <= 0)
                throw new BadRequestException("Coupon ID must be greater than zero.");

            if (dto == null)
                throw new BadRequestException("Coupon data is required.");

            var coupon = await _couponRepository.GetByIdAsync(id);
            if (coupon == null)
                throw new NotFoundException($"Coupon with ID {id} not found.");

            var existing = await _couponRepository.GetByCodeAsync(dto.Code);
            if (existing != null && existing.Id != id)
                throw new ConflictException($"A coupon with code '{dto.Code}' already exists.");

            coupon.Code = dto.Code.ToUpperInvariant();
            coupon.DiscountType = dto.DiscountType;
            coupon.DiscountValue = dto.DiscountValue;
            coupon.StartDate = dto.StartDate;
            coupon.EndDate = dto.EndDate;
            coupon.UsageLimit = dto.UsageLimit;
            coupon.IsActive = dto.IsActive;

            _couponRepository.Update(coupon);
            await _unitOfWork.SaveChangesAsync();

            return CouponMapper.MapToDto(coupon);
        }

        public async Task<bool> DeleteCouponAsync(int id)
        {
            if (id <= 0)
                throw new BadRequestException("Coupon ID must be greater than zero.");

            var coupon = await _couponRepository.GetByIdAsync(id);
            if (coupon == null)
                throw new NotFoundException($"Coupon with ID {id} not found.");

            _couponRepository.Delete(coupon);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<Coupon> ValidateAndGetCouponAsync(int customerId, string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new BadRequestException("Coupon code is required.");

            var coupon = await _couponRepository.GetByCodeAsync(code.ToUpperInvariant());
            if (coupon == null || !coupon.IsActive)
                throw new BadRequestException("Coupon is invalid or inactive.");

            var now = DateTime.UtcNow;
            if (now < coupon.StartDate || now > coupon.EndDate)
                throw new BadRequestException("Coupon has expired or is not yet valid.");

            if (coupon.UsageLimit.HasValue && coupon.TimesUsed >= coupon.UsageLimit.Value)
                throw new BadRequestException("Coupon usage limit has been reached.");

            var hasUsed = await _couponUsageRepository.HasCustomerUsedCouponAsync(customerId, coupon.Id);
            if (hasUsed)
                throw new BadRequestException("You have already used this coupon.");

            return coupon;
        }
    }
}
