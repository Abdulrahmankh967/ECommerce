using _1_Repository.Data;
using _1_Repository.Interfaces;
using _2_Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace _2_Services.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CategoryService(ICategoryRepository categoryRepository, IUnitOfWork unitOfWork)
        {
            _categoryRepository = categoryRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<CategoryDto>> GetAllCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return CategoryMapper.MapToDtoList(categories);
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
        {
            if (id <= 0)
                throw new BadRequestException("Category ID must be greater than zero.");

            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                throw new NotFoundException($"Category with ID {id} not found.");

            return CategoryMapper.MapToDto(category);
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
        {
            if (dto == null)
                throw new BadRequestException("Category data is required.");

            if (dto.ParentCategoryId.HasValue)
            {
                if (dto.ParentCategoryId.Value <= 0)
                    throw new BadRequestException("Parent category ID must be greater than zero.");

                var parent = await _categoryRepository.GetByIdAsync(dto.ParentCategoryId.Value);
                if (parent == null)
                    throw new NotFoundException($"Parent category with ID {dto.ParentCategoryId.Value} not found.");
            }

            var category = CategoryMapper.MapToEntity(dto);

            await _categoryRepository.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();

            return CategoryMapper.MapToDto(category);
        }

        public async Task<CategoryDto?> UpdateCategoryAsync(int id, CreateCategoryDto dto)
        {
            if (id <= 0)
                throw new BadRequestException("Category ID must be greater than zero.");

            if (dto == null)
                throw new BadRequestException("Category data is required.");

            if (dto.ParentCategoryId.HasValue)
            {
                if (dto.ParentCategoryId.Value == id)
                    throw new BadRequestException("A category cannot be its own parent.");

                if (dto.ParentCategoryId.Value <= 0)
                    throw new BadRequestException("Parent category ID must be greater than zero.");

                var parent = await _categoryRepository.GetByIdAsync(dto.ParentCategoryId.Value);
                if (parent == null)
                    throw new NotFoundException($"Parent category with ID {dto.ParentCategoryId.Value} not found.");
            }

            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                throw new NotFoundException($"Category with ID {id} not found.");

            CategoryMapper.UpdateEntity(category, dto);

            _categoryRepository.Update(category);
            await _unitOfWork.SaveChangesAsync();

            return CategoryMapper.MapToDto(category);
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            if (id <= 0)
                throw new BadRequestException("Category ID must be greater than zero.");

            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                throw new NotFoundException($"Category with ID {id} not found.");

            _categoryRepository.Delete(category);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
