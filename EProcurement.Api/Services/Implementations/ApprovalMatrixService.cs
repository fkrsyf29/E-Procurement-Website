using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class ApprovalMatrixService : IApprovalMatrixService
    {
        private readonly IApprovalMatrixRepository _repo;

        public ApprovalMatrixService(IApprovalMatrixRepository repo)
        {
            _repo = repo;
        }

        public Task<IEnumerable<ApprovalMatrixDto>> GetAllAsync()
        {
            return _repo.GetAllAsync();
        }

        public Task<int> SaveAsync(ApprovalMatrixSaveRequest req)
        {
            // Validasi Bisnis Logic bisa ditambahkan di sini
            // Contoh: Validasi AmountMax > AmountMin
            if (req.AmountMax.HasValue && req.AmountMax.Value <= req.AmountMin)
            {
                throw new ArgumentException("Maximum amount must be greater than minimum amount.");
            }

            if (req.Steps == null || !req.Steps.Any())
            {
                throw new ArgumentException("Approval Matrix must have at least one step.");
            }

            return _repo.SaveAsync(req);
        }

        public Task DeleteAsync(int id, string user)
        {
            return _repo.DeleteAsync(id, user);
        }
    }
}