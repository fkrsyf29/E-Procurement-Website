using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IProposalService
    {
        Task<long> CreateProposalAsync(CreateProposalRequest request);
        Task<IEnumerable<ProposalResponse>> GetMyProposalsAsync(int userId);
        Task<IEnumerable<ProposalResponse>> GetMyApprovalsAsync(int userId);
        Task<ProposalResponse?> GetProposalDetailAsync(long id);
        Task ProcessApprovalAsync(ApproveProposalRequest request);
        Task<IEnumerable<ProposalResponse>> GetDashboardAsync(int userId);
        Task UpdateVendorStatusAsync(long proposalId, string status, int userId, string userName);
    }
}