using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IItemDefinitionService
    {
        Task<IEnumerable<ItemDefinitionDto>> GetAllAsync();
        Task<ItemDefinitionDto?> GetByIdAsync(int id);
        Task<ItemDefinitionDto> InsertAsync(ItemDefinitionCreateRequest request);
        Task<ItemDefinitionDto> UpdateAsync(ItemDefinitionUpdateRequest request);
        Task UpdateOrderAsync(ItemDefinitionReorderRequest request);
    }
}