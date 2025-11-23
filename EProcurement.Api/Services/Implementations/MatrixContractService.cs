using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class MatrixContractService : IMatrixContractService
    {
        private readonly IMatrixContractRepository _repo;

        public MatrixContractService(IMatrixContractRepository repo)
        {
            _repo = repo;
        }

        public Task<IEnumerable<MatrixContractDto>> GetAllAsync() => _repo.GetAllAsync();

        public Task<MatrixContractDto?> GetByIdAsync(int matrixContractId) => _repo.GetByIdAsync(matrixContractId);

        public Task<MatrixContractDto> InsertAsync(MatrixContractCreateRequest request) => _repo.InsertAsync(request);

        public Task<MatrixContractDto> UpdateAsync(MatrixContractUpdateRequest request) => _repo.UpdateAsync(request);

        public Task UpdateOrderAsync(MatrixContractReorderRequest request) => _repo.UpdateOrderAsync(request);
    }
}