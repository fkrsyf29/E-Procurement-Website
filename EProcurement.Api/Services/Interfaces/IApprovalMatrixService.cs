using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IApprovalMatrixService
    {
        Task<IEnumerable<ApprovalMatrixDto>> GetAllAsync();
        Task<int> SaveAsync(ApprovalMatrixSaveRequest req);
        Task DeleteAsync(int id, string user);
    }
}