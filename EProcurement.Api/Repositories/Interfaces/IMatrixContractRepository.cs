using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IMatrixContractRepository
    {
        Task<IEnumerable<MatrixContractDto>> GetAllAsync();
        Task<MatrixContractDto?> GetByIdAsync(int matrixContractId);
        Task<MatrixContractDto> InsertAsync(MatrixContractCreateRequest request);
        Task<MatrixContractDto> UpdateAsync(MatrixContractUpdateRequest request);
        Task UpdateOrderAsync(MatrixContractReorderRequest request);
    }
}