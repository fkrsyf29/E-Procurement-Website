using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IApprovalRoleRepository
    {
        Task<IEnumerable<ApprovalRoleDto>> GetAllAsync();
    }
}
