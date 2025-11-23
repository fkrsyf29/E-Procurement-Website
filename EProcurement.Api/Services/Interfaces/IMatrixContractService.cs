using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IMatrixContractService
    {
        Task<IEnumerable<MatrixContractDto>> GetAllAsync();
        Task<MatrixContractDto?> GetByIdAsync(int matrixContractId);
        Task<MatrixContractDto> InsertAsync(MatrixContractCreateRequest request);
        Task<MatrixContractDto> UpdateAsync(MatrixContractUpdateRequest request);
        Task UpdateOrderAsync(MatrixContractReorderRequest request);
    }
}