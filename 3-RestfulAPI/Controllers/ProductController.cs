using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace _3_RestfulAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ProductService _productService;


        public ProductController(ProductService productService)
        {
            _productService = productService;
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _productService.GetAllProductsAsync();

            return Ok(products);
        }

    }
}
