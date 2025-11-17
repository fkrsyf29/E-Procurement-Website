using Microsoft.AspNetCore.Mvc;
using EProcurement.Api.Services.Interfaces;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _service;

        public RoleController(IRoleService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{roleId}")]
        public async Task<IActionResult> GetById(string roleId)
        {
            var result = await _service.GetByIdAsync(roleId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Insert(RoleCreateRequest request)
        {
            RoleInsertResult result = await _service.InsertAsync(request);

            return Ok(new { message = "Role created successfully", data = result });
        }

        [HttpPut("{roleId}")]
        public async Task<IActionResult> Update(int roleId, RoleUpdateRequest request)
        {
            request.RoleId = roleId;

            RoleUpdateResult result = await _service.UpdateAsync(request);

            return Ok(new { message = "Role updated successfully", data = result });
        }
    }
}
