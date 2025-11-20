using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IRoleCategoryRepository
    {
        Task<IEnumerable<RoleCategoryDto>> GetAllAsync();
    }
}
