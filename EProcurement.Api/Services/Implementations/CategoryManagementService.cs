using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class CategoryManagementService : ICategoryManagementService
    {
        private readonly ICategoryManagementRepository _repo;

        public CategoryManagementService(ICategoryManagementRepository repo)
        {
            _repo = repo;
        }

        public Task<IEnumerable<CategoryDto>> GetAllHierarchyAsync() => _repo.GetAllHierarchyAsync();

        public Task<int> CreateCategory(CategoryManagementCreateRequest req) => _repo.CreateCategory(req);
        public Task UpdateCategory(CategoryManagementUpdateRequest req) => _repo.UpdateCategory(req);

        public Task<int> CreateClassification(ClassificationCreateRequest req) => _repo.CreateClassification(req);
        public Task UpdateClassification(ClassificationUpdateRequest req) => _repo.UpdateClassification(req);

        public Task<int> CreateSubClassification(SubClassificationCreateRequest req) => _repo.CreateSubClassification(req);
        public Task UpdateSubClassification(SubClassificationUpdateRequest req) => _repo.UpdateSubClassification(req);
    }
}