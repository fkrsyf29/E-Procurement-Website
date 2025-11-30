using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IProposalRepository
    {
        Task<long> CreateAsync(CreateProposalRequest request);
        Task<ProposalResponse?> GetByIdAsync(long id);
        Task<IEnumerable<ProposalResponse>> GetByCreatorAsync(int userId);

        Task<IEnumerable<ProposalResponse>> GetMyApprovalsAsync(int userId);

        Task ApproveAsync(long proposalId, int actorId, string comment);
        Task RejectAsync(long proposalId, int actorId, string comment);
        Task<IEnumerable<ProposalResponse>> GetDashboardAsync(int userId);
        Task UpdateVendorStatusAsync(long proposalId, string status, int userId, string userName);
    }
}