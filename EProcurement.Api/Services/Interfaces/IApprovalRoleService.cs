using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IApprovalRoleService
    {
        Task<IEnumerable<ApprovalRoleDto>> GetAllAsync();
    }
}
