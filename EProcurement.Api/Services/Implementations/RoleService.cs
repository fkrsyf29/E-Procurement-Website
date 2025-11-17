using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _repo;

        public RoleService(IRoleRepository repo)
        {
            _repo = repo;
        }

        public Task<IEnumerable<RoleDto>> GetAllAsync() => _repo.GetAllAsync();

        public Task<RoleDto?> GetByIdAsync(string roleId) => _repo.GetByIdAsync(roleId);

        public Task<RoleInsertResult> InsertAsync(RoleCreateRequest request) => _repo.InsertAsync(request);

        public Task<RoleUpdateResult> UpdateAsync(RoleUpdateRequest request) => _repo.UpdateAsync(request);
    }
}
