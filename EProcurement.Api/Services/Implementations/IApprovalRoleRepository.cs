using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class ApprovalRoleService : IApprovalRoleService
    {
        private readonly IApprovalRoleRepository _repo;

        public ApprovalRoleService(IApprovalRoleRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<ApprovalRoleDto>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }
    }
}
