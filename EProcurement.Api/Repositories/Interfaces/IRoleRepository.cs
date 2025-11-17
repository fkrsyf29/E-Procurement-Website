using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IRoleRepository
    {
        Task<IEnumerable<RoleDto>> GetAllAsync();
        Task<RoleDto?> GetByIdAsync(string roleId);
        Task<RoleInsertResult> InsertAsync(RoleCreateRequest req);
        Task<RoleUpdateResult> UpdateAsync(RoleUpdateRequest request);
    }
}
