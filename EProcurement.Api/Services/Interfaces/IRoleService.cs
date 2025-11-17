using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleDto>> GetAllAsync();
        Task<RoleDto?> GetByIdAsync(string roleId);
        Task<RoleInsertResult> InsertAsync(RoleCreateRequest request);
        Task<RoleUpdateResult> UpdateAsync(RoleUpdateRequest request);
    }
}
