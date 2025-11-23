using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IItemDefinitionRepository
    {
        Task<IEnumerable<ItemDefinitionDto>> GetAllAsync();
        Task<ItemDefinitionDto?> GetByIdAsync(int id);
        Task<ItemDefinitionDto> InsertAsync(ItemDefinitionCreateRequest req);
        Task<ItemDefinitionDto> UpdateAsync(ItemDefinitionUpdateRequest req, string category, int orderNo);
        Task UpdateOrderAsync(ItemDefinitionReorderRequest req);
    }
}