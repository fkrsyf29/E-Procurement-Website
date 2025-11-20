using Microsoft.AspNetCore.Mvc;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleCategoryController : ControllerBase
    {
        private readonly IRoleCategoryService _service;

        public RoleCategoryController(IRoleCategoryService service)
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
