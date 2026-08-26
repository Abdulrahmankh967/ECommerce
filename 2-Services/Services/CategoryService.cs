using _1_Repository.Data;
using _1_Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace _2_Services.Services
{
    public class CategoryService
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
            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                ProductCount = c.Products?.Count ?? 0
            }).ToList();
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
        {
            if (id <= 0)
                throw new BadRequestException("Category ID must be greater than zero.");

            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                throw new NotFoundException($"Category with ID {id} not found.");

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                ProductCount = category.Products?.Count ?? 0
            };
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
        {
            if (dto == null)
                throw new BadRequestException("Category data is required.");

            var category = new Category
            {
                Name = dto.Name
            };

            await _categoryRepository.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name
            };
        }

        public async Task<CategoryDto?> UpdateCategoryAsync(int id, CreateCategoryDto dto)
        {
            if (id <= 0)
                throw new BadRequestException("Category ID must be greater than zero.");

            if (dto == null)
                throw new BadRequestException("Category data is required.");

            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                throw new NotFoundException($"Category with ID {id} not found.");

            category.Name = dto.Name;
            _categoryRepository.Update(category);
            await _unitOfWork.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name
            };
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
