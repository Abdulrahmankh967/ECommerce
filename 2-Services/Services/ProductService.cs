using _1_Repository.Data;
using _1_Repository.Interfaces;
using _2_Services.DTOs;
using _2_Services.Interfaces;
using Microsoft.Extensions.Logging;
using Elastic.Clients.Elasticsearch;


namespace _2_Services.Services
{
    public class ProductService : IProductService
    {
        private const string ProductsIndex = "products";
        private readonly IProductRepository _productRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ProductService> _logger;
        private readonly ElasticsearchClient _elasticClient;

        public ProductService(
            IProductRepository productRepository,
            ICategoryRepository categoryRepository,
            IUnitOfWork unitOfWork,
            ILogger<ProductService> logger,
            ElasticsearchClient elasticsearch)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _elasticClient = elasticsearch;
        }

        public async Task<IEnumerable<ProductDTO>> SearchProductsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return Enumerable.Empty<ProductDTO>();

            var cleanQuery = query.Trim();

            try
            {
                var response = await _elasticClient.SearchAsync<ProductDTO>(s => s
                    .Indices(ProductsIndex)
                    .Query(q => q
                        .Bool(b => b
                            .Should(
                                sh => sh.MultiMatch(m => m
                                    .Query(cleanQuery)
                                    .Fields(new[] { "name^3", "categoryName^2" })
                                    .Fuzziness(new Fuzziness(2))
                                ),
                                sh => sh.Wildcard(w => w
                                    .Field(Infer.Field<ProductDTO>(p => p.Name))
                                    .Value($"*{cleanQuery.ToLowerInvariant()}*")
                                    .CaseInsensitive(true)
                                ),
                                sh => sh.Wildcard(w => w
                                    .Field(Infer.Field<ProductDTO>(p => p.CategoryName))
                                    .Value($"*{cleanQuery.ToLowerInvariant()}*")
                                    .CaseInsensitive(true)
                                )
                            )
                            .MinimumShouldMatch(1)
                        )
                    )
                );

                if (response.IsValidResponse)
                {
                    return response.Documents;
                }

                _logger.LogWarning("Elasticsearch search failed: {ServerError}. Falling back to database search.", response.ElasticsearchServerError);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching products via Elasticsearch for query: {Query}. Falling back to database search.", query);
            }

            return await SearchDatabaseFallbackAsync(cleanQuery);
        }

        private async Task<IEnumerable<ProductDTO>> SearchDatabaseFallbackAsync(string cleanQuery)
        {
            try
            {
                var products = await _productRepository.GetAllAsync();
                return products
                    .Where(p => p.Name.Contains(cleanQuery, StringComparison.OrdinalIgnoreCase) ||
                                (p.Category != null && p.Category.Name.Contains(cleanQuery, StringComparison.OrdinalIgnoreCase)))
                    .Select(p => ProductMapper.MapToDto(p))
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database fallback search failed for query: {Query}", cleanQuery);
                return Enumerable.Empty<ProductDTO>();
            }
        }

        public async Task<bool> ReindexAllProductsAsync()
        {
            try
            {
                var products = await GetAllProductsAsync();

                if (!products.Any())
                    return true;

                var response = await _elasticClient.IndexManyAsync(products, ProductsIndex);

                if (!response.IsValidResponse)
                {
                    _logger.LogError("Failed to reindex products to Elasticsearch: {ServerError}", response.ElasticsearchServerError);
                    return false;
                }

                _logger.LogInformation("Successfully reindexed {Count} products into Elasticsearch", products.Count);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception during Elasticsearch reindexing");
                return false;
            }
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

            var createdDto = ProductMapper.MapToDto(product, category.Name);

            // Sync with Elasticsearch
            try
            {
                var esResponse = await _elasticClient.IndexAsync(createdDto, idx => idx.Index(ProductsIndex).Id(createdDto.Id));
                if (!esResponse.IsValidResponse)
                {
                    _logger.LogWarning("Failed to index new product {ProductId} into Elasticsearch: {ServerError}", createdDto.Id, esResponse.ElasticsearchServerError);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception while indexing product {ProductId} into Elasticsearch", createdDto.Id);
            }

            return createdDto;
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

            var updatedDto = ProductMapper.MapToDto(product, category.Name);

            // Sync with Elasticsearch
            try
            {
                var esResponse = await _elasticClient.IndexAsync(updatedDto, idx => idx.Index(ProductsIndex).Id(updatedDto.Id));
                if (!esResponse.IsValidResponse)
                {
                    _logger.LogWarning("Failed to update product {ProductId} in Elasticsearch: {ServerError}", id, esResponse.ElasticsearchServerError);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception while updating product {ProductId} in Elasticsearch", id);
            }

            return updatedDto;
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

            // Sync deletion with Elasticsearch
            try
            {
                var esResponse = await _elasticClient.DeleteAsync<ProductDTO>(id, idx => idx.Index(ProductsIndex));
                if (!esResponse.IsValidResponse)
                {
                    _logger.LogWarning("Failed to delete product {ProductId} from Elasticsearch: {ServerError}", id, esResponse.ElasticsearchServerError);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception while deleting product {ProductId} from Elasticsearch", id);
            }

            return true;
        }
    }
}
