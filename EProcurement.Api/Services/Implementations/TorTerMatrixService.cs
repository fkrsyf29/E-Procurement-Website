using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Implementations;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    // INTERFACE
    public interface ITorTerMatrixService
    {
        Task<IEnumerable<MatrixAssignmentDto>> GetBySubClassificationAsync(int subClassificationId);
        Task SaveMatrixAsync(TorTerMatrixSaveRequest req);
    }

    // IMPLEMENTATION
    public class TorTerMatrixService : ITorTerMatrixService
    {
        private readonly ITorTerMatrixRepository _repo;

        public TorTerMatrixService(ITorTerMatrixRepository repo)
        {
            _repo = repo;
        }

        public Task<IEnumerable<MatrixAssignmentDto>> GetBySubClassificationAsync(int id) => _repo.GetBySubClassificationAsync(id);
        public Task SaveMatrixAsync(TorTerMatrixSaveRequest req) => _repo.SaveMatrixAsync(req);
    }
}