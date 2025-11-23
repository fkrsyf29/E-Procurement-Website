using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class RegionService : IRegionService
    {
        private readonly IRegionRepository _repo;

        public RegionService(IRegionRepository repo)
        {
            _repo = repo;
        }

        public Task<IEnumerable<RegionDto>> GetAllAsync() => _repo.GetAllAsync();
    }
}
