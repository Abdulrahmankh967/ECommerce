namespace _2_Services.Interfaces
{
    public interface IReviewService
    {
        Task<List<ReviewDto>> GetReviewsByProductAsync(int productId);
        Task<ReviewDto> AddReviewAsync(int customerId, CreateReviewDto dto);
        Task<bool> DeleteReviewAsync(int reviewId, int customerId, bool isAdmin);
    }
}
