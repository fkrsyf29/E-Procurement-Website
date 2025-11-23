using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class ItemDefinitionService : IItemDefinitionService
    {
        private readonly IItemDefinitionRepository _repo;

        public ItemDefinitionService(IItemDefinitionRepository repo)
        {
            _repo = repo;
        }

        public Task<IEnumerable<ItemDefinitionDto>> GetAllAsync() => _repo.GetAllAsync();

        public Task<ItemDefinitionDto?> GetByIdAsync(int id) => _repo.GetByIdAsync(id);

        public async Task<ItemDefinitionDto> InsertAsync(ItemDefinitionCreateRequest request)
        {
            // Business Logic: Pastikan Category diubah menjadi UPPERCASE sebelum disimpan
            request.Category = request.Category.ToUpper();
            return await _repo.InsertAsync(request);
        }

        public async Task<ItemDefinitionDto> UpdateAsync(ItemDefinitionUpdateRequest request)
        {
            var currentData = await _repo.GetByIdAsync(request.ItemDefinitionID);
            if (currentData == null)
            {
                throw new KeyNotFoundException($"Item Definition with ID {request.ItemDefinitionID} not found.");
            }

            var finalCategory = currentData.Category;
            var finalOrderNo = currentData.Order;

            request.Code = request.Code ?? currentData.Code;
            request.Label = request.Label ?? currentData.Label;
            request.IsActive = request.IsActive ?? currentData.IsActive;
            request.ValidationSource = request.ValidationSource ?? currentData.ValidationSource;

            DateTime? finalDeletedAt = currentData.DeletedAt;
            string? finalDeletedBy = currentData.DeletedBy;

            if (currentData.IsActive == true && request.IsActive == false)
            {
                finalDeletedAt = DateTime.UtcNow;
                finalDeletedBy = request.UpdatedBy;
            }
            else if (request.IsActive == true)
            {
                // Jika diaktifkan, reset DeletedAt/DeletedBy
                finalDeletedAt = null;
                finalDeletedBy = null;
            }

            return await _repo.UpdateAsync(
                request,
                finalCategory,
                finalOrderNo
            );
        }

        public Task UpdateOrderAsync(ItemDefinitionReorderRequest request) => _repo.UpdateOrderAsync(request);
    }
}