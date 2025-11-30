using System.Threading.Tasks;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EProcurement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialController : ControllerBase
    {
        private readonly IMaterialService _service;

        public MaterialController(IMaterialService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllMaterialsAsync();
            return Ok(new { data = result });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaterialCreateRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.CreateMaterialAsync(request);
            return Ok(new { message = "Material created successfully", data = result });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MaterialUpdateRequest request)
        {
            if (id != request.MaterialID) return BadRequest("ID mismatch");

            await _service.UpdateMaterialAsync(request);
            return Ok(new { message = "Material updated successfully" });
        }
    }
}