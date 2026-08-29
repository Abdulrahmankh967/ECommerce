using _1_Repository.Data;
using _1_Repository.Interfaces;
using _2_Services.DTOs;
using Microsoft.Extensions.Logging;

namespace _2_Services.Services
{
    public class ProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ProductService> _logger;

        public ProductService(
            IProductRepository productRepository,
            ICategoryRepository categoryRepository,
            IUnitOfWork unitOfWork,
            ILogger<ProductService> logger)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<List<ProductDTO>> GetAllProductsAsync()
        {
            var products = await _productRepository.GetAllAsync();
            return products.Select(p => ProductMapper.MapToDto(p)).ToList();
        }

        public async Task<ProductDTO?> GetProductByIdAsync(int id)
        {
            if (id <= 0)
                throw new BadRequestException("Product ID must be greater than zero.");

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                throw new NotFoundException($"Product with ID {id} not found.");

            return ProductMapper.MapToDto(product);
        }

        public async Task<List<ProductDTO>> GetProductsByCategoryAsync(int categoryId)
        {
            if (categoryId <= 0)
                throw new BadRequestException("Category ID must be greater than zero.");

            var products = await _productRepository.GetProductsByCategoryAsync(categoryId);
            return products.Select(p => ProductMapper.MapToDto(p)).ToList();
        }

        public async Task<ProductDTO> CreateProductAsync(CreateProductDto dto)
        {
            if (dto == null)
                throw new BadRequestException("Product data is required.");

            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null)
                throw new NotFoundException($"Category with ID {dto.CategoryId} not found.");

            var product = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Stock = dto.Stock,
                IsActive = dto.IsActive,
                ImageUrl = dto.ImageUrl,
                CategoryId = dto.CategoryId
            };

            await _productRepository.AddAsync(product);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Product created with ID {ProductId}", product.Id);

            return ProductMapper.MapToDto(product, category.Name);
        }

        public async Task<ProductDTO?> UpdateProductAsync(int id, UpdateProductDto dto)
        {
            if (id <= 0)
                throw new BadRequestException("Product ID must be greater than zero.");

            if (dto == null)
                throw new BadRequestException("Product data is required.");

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                throw new NotFoundException($"Product with ID {id} not found.");

            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null)
                throw new NotFoundException($"Category with ID {dto.CategoryId} not found.");

            product.Name = dto.Name;
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.IsActive = dto.IsActive;
            product.ImageUrl = dto.ImageUrl;
            product.CategoryId = dto.CategoryId;

            _productRepository.Update(product);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Product {ProductId} updated", id);

            return ProductMapper.MapToDto(product, category.Name);
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            if (id <= 0)
                throw new BadRequestException("Product ID must be greater than zero.");

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                throw new NotFoundException($"Product with ID {id} not found.");

            _productRepository.Delete(product);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Product {ProductId} deleted", id);
            return true;
        }
    }
}