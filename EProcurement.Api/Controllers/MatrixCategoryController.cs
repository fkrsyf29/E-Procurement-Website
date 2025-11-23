using Microsoft.AspNetCore.Mvc;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatrixCategoryController : ControllerBase
    {
        private readonly IMatrixCategoryService _service;

        public MatrixCategoryController(IMatrixCategoryService service)
        {
            _service = service;
        }

        [HttpGet("hierarchy")]
        public async Task<IActionResult> GetHierarchy()
        {
            return Ok(await _service.GetHierarchyAsync());
        }
    }
}
