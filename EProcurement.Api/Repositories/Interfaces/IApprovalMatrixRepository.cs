using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IApprovalMatrixRepository
    {
        Task<IEnumerable<ApprovalMatrixDto>> GetAllAsync();
        Task<int> SaveAsync(ApprovalMatrixSaveRequest req);
        Task DeleteAsync(int id, string user);
    }
}