using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface ISystemDataService
    {
        Task<List<SystemDataCategoryDto>> GetAllSystemDataAsync();
        Task<SystemDataItemDto> CreateItemAsync(string categoryCode, CreateSystemDataItemRequest request);
        Task<bool> UpdateItemAsync(string categoryCode, string id, UpdateSystemDataItemRequest request);
        Task<bool> DeleteItemAsync(string categoryCode, string id);
        Task<bool> ReorderItemsAsync(string categoryCode, List<string> itemIds);
    }
}
