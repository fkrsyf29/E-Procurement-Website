using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface ICategoryManagementRepository
    {
        Task<IEnumerable<CategoryDto>> GetAllHierarchyAsync();

        Task<int> CreateCategory(CategoryManagementCreateRequest req);
        Task UpdateCategory(CategoryManagementUpdateRequest req);

        Task<int> CreateClassification(ClassificationCreateRequest req);
        Task UpdateClassification(ClassificationUpdateRequest req);

        Task<int> CreateSubClassification(SubClassificationCreateRequest req);
        Task UpdateSubClassification(SubClassificationUpdateRequest req);
    }
}