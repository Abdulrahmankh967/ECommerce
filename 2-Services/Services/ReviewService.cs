using _1_Repository.Data;
using _1_Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace _2_Services.Services
{
    public class ReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IProductRepository _productRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ReviewService(
            IReviewRepository reviewRepository,
            ICustomerRepository customerRepository,
            IProductRepository productRepository,
            IUnitOfWork unitOfWork)
        {
            _reviewRepository = reviewRepository;
            _customerRepository = customerRepository;
            _productRepository = productRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<ReviewDto>> GetReviewsByProductAsync(int productId)
        {
            if (productId <= 0)
                throw new BadRequestException("Product ID must be greater than zero.");

            var allReviews = await _reviewRepository.GetAllAsync();
            var productReviews = allReviews.Where(r => r.ProductId == productId).ToList();

            var dtos = new List<ReviewDto>();
            foreach (var review in productReviews)
            {
                string customerName = "Unknown";
                if (review.CustomerId > 0)
                {
                    var customer = await _customerRepository.GetByIdAsync(review.CustomerId);
                    if (customer != null)
                    {
                        customerName = customer.FullName;
                    }
                }

                dtos.Add(new ReviewDto
                {
                    Id = review.Id,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt,
                    CustomerId = review.CustomerId,
                    CustomerName = customerName,
                    ProductId = review.ProductId
                });
            }

            return dtos;
        }

        public async Task<ReviewDto> AddReviewAsync(int customerId, CreateReviewDto dto)
        {
            if (customerId <= 0)
                throw new BadRequestException("Customer ID must be greater than zero.");

            if (dto == null)
                throw new BadRequestException("Review data is required.");

            var customer = await _customerRepository.GetByIdAsync(customerId);
            if (customer == null)
                throw new NotFoundException($"Customer with ID {customerId} not found.");

            var product = await _productRepository.GetByIdAsync(dto.ProductId);
            if (product == null)
                throw new NotFoundException($"Product with ID {dto.ProductId} not found.");

            var review = new Review
            {
                CustomerId = customerId,
                ProductId = dto.ProductId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepository.AddAsync(review);
            await _unitOfWork.SaveChangesAsync();

            return new ReviewDto
            {
                Id = review.Id,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                CustomerId = review.CustomerId,
                CustomerName = customer.FullName,
                ProductId = review.ProductId
            };
        }

        public async Task<bool> DeleteReviewAsync(int reviewId, int customerId, bool isAdmin)
        {
            if (reviewId <= 0)
                throw new BadRequestException("Review ID must be greater than zero.");

            var review = await _reviewRepository.GetByIdAsync(reviewId);
            if (review == null)
                throw new NotFoundException($"Review with ID {reviewId} not found.");

            if (!isAdmin && review.CustomerId != customerId)
                throw new ForbiddenException("You do not have permission to delete this review.");

            _reviewRepository.Delete(review);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
