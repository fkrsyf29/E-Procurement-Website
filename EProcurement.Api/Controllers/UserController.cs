using Microsoft.AspNetCore.Mvc;
using EProcurement.Api.Services.Interfaces;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;

        public UserController(IUserService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{UserId}")]
        public async Task<IActionResult> GetById(string UserId)
        {
            var result = await _service.GetByIdAsync(UserId);
            if (result == null) return NotFound();
            return Ok(new
            {
                success = true,
                user = result
            });
        }

        [HttpGet("name/{UserName}")]
        public async Task<IActionResult> GetByName(string UserName)
        {
            var result = await _service.GetByNameAsync(UserName);
            if (result == null) return NotFound();
            return Ok(new
            {
                success = true,
                user = result
            });
        }

        [HttpPost]
        public async Task<IActionResult> Insert(UserCreateRequest request)
        {
            UserInsertResult result = await _service.InsertAsync(request);

            return Ok(new { message = "User created successfully", data = result });
        }

        [HttpPut("{UserId}")]
        public async Task<IActionResult> Update(int UserId, UserUpdateRequest request)
        {
            request.UserID = UserId;

            UserUpdateResult result = await _service.UpdateAsync(request);

            return Ok(new { message = "User updated successfully", data = result });
        }
    }
}
