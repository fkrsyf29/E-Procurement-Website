using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface ICategoryRepository
    {
        // --- HIERARCHY FETCH ---
        // Fetches Categories, Classifications, and SubClassifications in one go
        Task<IEnumerable<CategoryDto>> GetAllHierarchyAsync();

        // --- CATEGORY CRUD ---
        Task<int> CreateCategory(CategoryCreateRequest req);
        Task UpdateCategory(CategoryUpdateRequest req);
        // Delete is handled via Update (Soft Delete)

        // --- CLASSIFICATION CRUD ---
        Task<int> CreateClassification(ClassificationCreateRequest req);
        Task UpdateClassification(ClassificationUpdateRequest req);

        // --- SUBCLASSIFICATION CRUD ---
        Task<int> CreateSubClassification(SubClassificationCreateRequest req);
        Task UpdateSubClassification(SubClassificationUpdateRequest req);
    }
}