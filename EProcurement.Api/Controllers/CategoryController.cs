using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.Repositories.Implementations;
using EProcurement.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryRepository _repo; // Gunakan Service Layer di project nyata, disini langsung Repo untuk ringkas

        public CategoryController(ICategoryRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("Hierarchy")]
        public async Task<IActionResult> GetAllHierarchy()
        {
            return Ok(await _repo.GetAllHierarchyAsync());
        }

        // --- CATEGORY ---
        [HttpPost("Category")]
        public async Task<IActionResult> CreateCategory(CategoryCreateRequest req)
        {
            var id = await _repo.CreateCategory(req);
            return Ok(new { message = "Category created", id });
        }
        [HttpPut("Category/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, CategoryUpdateRequest req)
        {
            req.CategoryID = id;
            await _repo.UpdateCategory(req);
            return Ok(new { message = "Category updated" });
        }

        // --- CLASSIFICATION ---
        [HttpPost("Classification")]
        public async Task<IActionResult> CreateClassification(ClassificationCreateRequest req)
        {
            var id = await _repo.CreateClassification(req);
            return Ok(new { message = "Classification created", id });
        }
        [HttpPut("Classification/{id}")]
        public async Task<IActionResult> UpdateClassification(int id, ClassificationUpdateRequest req)
        {
            req.ClassificationID = id;
            await _repo.UpdateClassification(req);
            return Ok(new { message = "Classification updated" });
        }

        // --- SUBCLASSIFICATION ---
        [HttpPost("SubClassification")]
        public async Task<IActionResult> CreateSubClassification(SubClassificationCreateRequest req)
        {
            var id = await _repo.CreateSubClassification(req);
            return Ok(new { message = "SubClassification created", id });
        }
        [HttpPut("SubClassification/{id}")]
        public async Task<IActionResult> UpdateSubClassification(int id, SubClassificationUpdateRequest req)
        {
            req.SubClassificationID = id;
            await _repo.UpdateSubClassification(req);
            return Ok(new { message = "SubClassification updated" });
        }
    }
}