using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class ProposalService : IProposalService
    {
        private readonly IProposalRepository _repo;

        public ProposalService(IProposalRepository repo)
        {
            _repo = repo;
        }

        public async Task<long> CreateProposalAsync(CreateProposalRequest request)
        {
            return await _repo.CreateAsync(request);
        }

        public async Task<IEnumerable<ProposalResponse>> GetMyProposalsAsync(int userId)
        {
            return await _repo.GetByCreatorAsync(userId);
        }

        public async Task<IEnumerable<ProposalResponse>> GetMyApprovalsAsync(int userId)
        {
            // Tidak ada logic filtering disini lagi!
            // SP Database yang akan cek permission user.
            return await _repo.GetMyApprovalsAsync(userId);
        }

        public async Task<ProposalResponse?> GetProposalDetailAsync(long id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task ProcessApprovalAsync(ApproveProposalRequest request)
        {
            if (request.Action == "Reject")
            {
                await _repo.RejectAsync(request.ProposalID, request.UserId, request.Comment);
            }
            else
            {
                await _repo.ApproveAsync(request.ProposalID, request.UserId, request.Comment);
            }
        }

        public async Task<IEnumerable<ProposalResponse>> GetDashboardAsync(int userId)
        {
            return await _repo.GetDashboardAsync(userId);
        }

        public async Task UpdateVendorStatusAsync(long proposalId, string status, int userId, string userName)
        {
            await _repo.UpdateVendorStatusAsync(proposalId, status, userId, userName);
        }
    }
}