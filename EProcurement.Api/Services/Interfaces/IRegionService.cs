using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IRegionService
    {
        Task<IEnumerable<RegionDto>> GetAllAsync();
    }
}
