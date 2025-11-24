using Microsoft.AspNetCore.Mvc;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApprovalMatrixController : ControllerBase
    {
        private readonly IApprovalMatrixService _service;

        public ApprovalMatrixController(IApprovalMatrixService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Save(ApprovalMatrixSaveRequest req)
        {
            try
            {
                // Jika req.MatrixID null -> Insert
                // Jika req.MatrixID ada -> Update
                var id = await _service.SaveAsync(req);

                string action = req.MatrixID.HasValue ? "updated" : "created";
                return Ok(new { message = $"Approval Matrix {action} successfully", id = id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // TODO: Ambil User ID dari Token/Context
            string currentUser = "SYSTEM"; // Sementara hardcode atau ambil dari User.Identity.Name

            await _service.DeleteAsync(id, currentUser);
            return Ok(new { message = "Approval Matrix deleted successfully" });
        }
    }
}