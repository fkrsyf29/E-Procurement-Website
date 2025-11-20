using Microsoft.AspNetCore.Mvc;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionCategoryController : ControllerBase
    {
        private readonly IPermissionCategoryService _service;

        public PermissionCategoryController(IPermissionCategoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }
    }
}
