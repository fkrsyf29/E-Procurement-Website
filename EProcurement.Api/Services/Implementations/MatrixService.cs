using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Implementations;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    // INTERFACE
    public interface IMatrixService
    {
        Task<IEnumerable<MatrixAssignmentDto>> GetBySubClassificationAsync(int subClassificationId);
        Task SaveMatrixAsync(MatrixSaveRequest req);
    }

    // IMPLEMENTATION
    public class MatrixService : IMatrixService
    {
        private readonly IMatrixRepository _repo;

        public MatrixService(IMatrixRepository repo)
        {
            _repo = repo;
        }

        public Task<IEnumerable<MatrixAssignmentDto>> GetBySubClassificationAsync(int id) => _repo.GetBySubClassificationAsync(id);
        public Task SaveMatrixAsync(MatrixSaveRequest req) => _repo.SaveMatrixAsync(req);
    }
}