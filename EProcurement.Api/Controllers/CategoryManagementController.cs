using Microsoft.AspNetCore.Mvc;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryManagementController : ControllerBase
    {
        private readonly ICategoryManagementService _service;

        public CategoryManagementController(ICategoryManagementService service)
        {
            _service = service;
        }

        [HttpGet("Hierarchy")]
        public async Task<IActionResult> GetAllHierarchy()
        {
            return Ok(await _service.GetAllHierarchyAsync());
        }

        // --- CATEGORY ---
        [HttpPost("Category")]
        public async Task<IActionResult> CreateCategory(CategoryManagementCreateRequest req)
        {
            var id = await _service.CreateCategory(req);
            return Ok(new { message = "Category created", id });
        }
        [HttpPut("Category/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, CategoryManagementUpdateRequest req)
        {
            req.CategoryID = id;
            await _service.UpdateCategory(req);
            return Ok(new { message = "Category updated" });
        }

        // --- CLASSIFICATION ---
        [HttpPost("Classification")]
        public async Task<IActionResult> CreateClassification(ClassificationCreateRequest req)
        {
            var id = await _service.CreateClassification(req);
            return Ok(new { message = "Classification created", id });
        }
        [HttpPut("Classification/{id}")]
        public async Task<IActionResult> UpdateClassification(int id, ClassificationUpdateRequest req)
        {
            req.ClassificationID = id;
            await _service.UpdateClassification(req);
            return Ok(new { message = "Classification updated" });
        }

        // --- SUBCLASSIFICATION ---
        [HttpPost("SubClassification")]
        public async Task<IActionResult> CreateSubClassification(SubClassificationCreateRequest req)
        {
            var id = await _service.CreateSubClassification(req);
            return Ok(new { message = "SubClassification created", id });
        }
        [HttpPut("SubClassification/{id}")]
        public async Task<IActionResult> UpdateSubClassification(int id, SubClassificationUpdateRequest req)
        {
            req.SubClassificationID = id;
            await _service.UpdateSubClassification(req);
            return Ok(new { message = "SubClassification updated" });
        }
    }
}