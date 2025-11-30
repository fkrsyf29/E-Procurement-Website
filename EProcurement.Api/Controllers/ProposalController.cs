using Microsoft.AspNetCore.Mvc;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProposalController : ControllerBase
    {
        private readonly IProposalService _service;

        public ProposalController(IProposalService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProposalRequest request)
        {
            try
            {
                var id = await _service.CreateProposalAsync(request);
                return Ok(new { Message = "Proposal created", Id = id });
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        [HttpGet("MyProposals")]
        public async Task<IActionResult> GetMyProposals([FromQuery] int userId)
        {
            var result = await _service.GetMyProposalsAsync(userId);
            return Ok(result);
        }

        // ENDPOINT REVOLUSIONER: Cukup kirim UserID!
        [HttpGet("MyApprovals")]
        public async Task<IActionResult> GetMyApprovals([FromQuery] int userId)
        {
            // Backend akan cek permission user ini di DB
            var result = await _service.GetMyApprovalsAsync(userId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetail(long id)
        {
            var result = await _service.GetProposalDetailAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPut("Approve")]
        public async Task<IActionResult> Approve([FromBody] ApproveProposalRequest request)
        {
            try
            {
                await _service.ProcessApprovalAsync(request);
                return Ok(new { Message = "Processed" });
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        [HttpGet("Dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] int userId)
        {
            if (userId <= 0) return BadRequest("UserId required");

            try
            {
                var result = await _service.GetDashboardAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}/VendorStatus")]
        public async Task<IActionResult> UpdateVendorStatus(
            long id,
            [FromBody] UpdateVendorStatusRequest request,
            [FromQuery] int userId,
            [FromQuery] string userName)
        {
            if (id != request.ProposalID) return BadRequest("ID mismatch");

            try
            {
                await _service.UpdateVendorStatusAsync(id, request.VendorConfirmationStatus, userId, userName);
                return Ok(new { Message = "Vendor status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}