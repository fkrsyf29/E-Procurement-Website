using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.Services.Implementations;
using EProcurement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TorTerMatrixController : ControllerBase
    {
        private readonly ITorTerMatrixService _service;

        public TorTerMatrixController(ITorTerMatrixService service)
        {
            _service = service;
        }

        [HttpGet("SubClassification/{id}")]
        public async Task<IActionResult> GetBySubClassification(int id)
        {
            var result = await _service.GetBySubClassificationAsync(id);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> SaveMatrix(TorTerMatrixSaveRequest req)
        {
            try
            {
                await _service.SaveMatrixAsync(req);
                return Ok(new { message = "Matrix configuration saved successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error saving matrix", details = ex.Message });
            }
        }
    }
}