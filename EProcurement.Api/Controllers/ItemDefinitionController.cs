using Microsoft.AspNetCore.Mvc;
using EProcurement.Api.Services.Interfaces;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemDefinitionController : ControllerBase
    {
        private readonly IItemDefinitionService _service;

        public ItemDefinitionController(IItemDefinitionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Insert(ItemDefinitionCreateRequest request)
        {
            try
            {
                ItemDefinitionDto result = await _service.InsertAsync(request);
                return Ok(new { message = "Item Definition created successfully", data = result });
            }
            catch (Exception ex)
            {
                // Handle duplicate code error (UX_ItemDefinition_Code)
                if (ex.Message.Contains("Code already exists"))
                {
                    return BadRequest(new { message = ex.Message });
                }
                return StatusCode(500, new { message = "Internal server error during insert.", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ItemDefinitionUpdateRequest request)
        {
            request.ItemDefinitionID = id;

            try
            {
                ItemDefinitionDto result = await _service.UpdateAsync(request);
                return Ok(new { message = "Item Definition updated successfully", data = result });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Item Definition ID {id} not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error during update.", details = ex.Message });
            }
        }

        [HttpPut("Reorder")]
        public async Task<IActionResult> Reorder(ItemDefinitionReorderRequest request)
        {
            try
            {
                await _service.UpdateOrderAsync(request);
                return Ok(new { message = "Item Definitions reordered successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error during reorder.", details = ex.Message });
            }
        }
    }
}