using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class RoleCategoryService : IRoleCategoryService
    {
        private readonly IRoleCategoryRepository _repo;

        public RoleCategoryService(IRoleCategoryRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<RoleCategoryDto>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }
    }
}
