using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class PermissionCategoryService : IPermissionCategoryService
    {
        private readonly IPermissionCategoryRepository _repo;

        public PermissionCategoryService(IPermissionCategoryRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<PermissionCategoryDto>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }
    }
}
