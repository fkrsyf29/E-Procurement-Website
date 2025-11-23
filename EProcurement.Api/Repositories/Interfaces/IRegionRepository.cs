using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IRegionRepository
    {
        Task<IEnumerable<RegionDto>> GetAllAsync();
    }
}
