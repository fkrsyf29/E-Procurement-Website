using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EProcurement.Api.Controllers
{
    [Route("api/system-data")]
    [ApiController]
    public class SystemDataController : ControllerBase
    {
        private readonly ISystemDataService _service;

        public SystemDataController(ISystemDataService service)
        {
            _service = service;
        }

        // GET: api/system-data
        // Mengambil semua data referensi sekaligus (grouped by category)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllSystemDataAsync();
            return Ok(result);
        }

        // POST: api/system-data/{categoryCode}
        [HttpPost("{categoryCode}")]
        public async Task<IActionResult> Create(string categoryCode, [FromBody] CreateSystemDataItemRequest request)
        {
            var result = await _service.CreateItemAsync(categoryCode, request);
            if (result == null) return BadRequest("Invalid category or failed to create item.");
            return Ok(result);
        }

        // PUT: api/system-data/{categoryCode}/{id}
        [HttpPut("{categoryCode}/{id}")]
        public async Task<IActionResult> Update(string categoryCode, string id, [FromBody] UpdateSystemDataItemRequest request)
        {
            var success = await _service.UpdateItemAsync(categoryCode, id, request);
            if (!success) return NotFound("Item not found or update failed.");
            return Ok(new { message = "Item updated successfully" });
        }

        // DELETE: api/system-data/{categoryCode}/{id}
        [HttpDelete("{categoryCode}/{id}/{user}")]
        public async Task<IActionResult> Delete(string categoryCode, string id, string user)
        {
            var success = await _service.DeleteItemAsync(categoryCode, id, user);
            if (!success) return NotFound("Item not found or delete failed.");
            return Ok(new { message = "Item deleted successfully" });
        }

        // POST: api/system-data/{categoryCode}/reorder
        [HttpPost("{categoryCode}/reorder")]
        public async Task<IActionResult> Reorder(string categoryCode, [FromBody] ReorderSystemDataRequest request)
        {
            var success = await _service.ReorderItemsAsync(categoryCode, request.ItemIds);
            if (!success) return BadRequest("Failed to reorder items.");
            return Ok(new { message = "Order updated successfully" });
        }
    }
}