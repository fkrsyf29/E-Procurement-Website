using Microsoft.AspNetCore.Mvc;
using EProcurement.Api.Services.Interfaces;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatrixContractConditionController : ControllerBase
    {
        private readonly IMatrixContractService _service;

        public MatrixContractConditionController(IMatrixContractService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Endpoint FE: /MatrixContractCondition
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{matrixContractId}")]
        public async Task<IActionResult> GetById(int matrixContractId)
        {
            // Endpoint FE: /MatrixContractCondition/{id}
            var result = await _service.GetByIdAsync(matrixContractId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Insert(MatrixContractCreateRequest request)
        {
            // Endpoint FE: /MatrixContractCondition
            MatrixContractDto result = await _service.InsertAsync(request);

            return Ok(new { message = "Matrix Contract Condition created successfully", data = result });
        }

        [HttpPut("{matrixContractId}")]
        public async Task<IActionResult> Update(int matrixContractId, MatrixContractUpdateRequest request)
        {
            // Endpoint FE: /MatrixContractCondition/{id}
            request.MatrixContractID = matrixContractId;

            MatrixContractDto result = await _service.UpdateAsync(request);

            return Ok(new { message = "Matrix Contract Condition updated successfully", data = result });
        }

        [HttpPut("Reorder")]
        public async Task<IActionResult> Reorder(MatrixContractReorderRequest request)
        {
            // Endpoint FE: /MatrixContractCondition/Reorder
            await _service.UpdateOrderAsync(request);

            return Ok(new { message = "Matrix Contract Conditions reordered successfully" });
        }
    }
}