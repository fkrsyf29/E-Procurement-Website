using EProcurement.Api.Entities;
using EProcurement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

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
            var result = await _service.GetAll();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetById(id);
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Role model)
        {
            var newId = await _service.Create(model);
            return Ok(new { id = newId });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Role model)
        {
            model.Id = id;
            await _service.Update(model);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.Delete(id);
            return Ok();
        }
    }
}
