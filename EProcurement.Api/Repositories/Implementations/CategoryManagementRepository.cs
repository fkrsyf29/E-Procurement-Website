using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.CategoryManagement; // Using Query/Commands
using System.Data;

namespace EProcurement.Api.Repositories.Implementations
{
    public class CategoryManagementRepository : DapperRepository, ICategoryManagementRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public CategoryManagementRepository(DbConnectionFactory connectionFactory) : base(connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllHierarchyAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            using var multi = await connection.QueryMultipleAsync(CategoryManagementQueries.GetAllHierarchy);

            var categories = (await multi.ReadAsync<CategoryDto>()).ToList();
            var classifications = (await multi.ReadAsync<ClassificationDto>()).ToList();
            var subClassifications = (await multi.ReadAsync<SubClassificationDto>()).ToList();

            foreach (var cat in categories)
            {
                cat.Classifications = classifications.Where(c => c.CategoryID == cat.CategoryID).ToList();
                foreach (var cls in cat.Classifications)
                {
                    cls.SubClassifications = subClassifications.Where(s => s.ClassificationID == cls.ClassificationID).ToList();
                }
            }

            return categories;
        }

        public async Task<int> CreateCategory(CategoryManagementCreateRequest req)
        {
            return await QuerySingleAsync<int>(CategoryManagementCommands.CreateCategory, req);
        }

        public async Task UpdateCategory(CategoryManagementUpdateRequest req)
        {
            var deletedAt = req.IsDeleted == true ? DateTime.UtcNow : (DateTime?)null;
            await ExecuteAsync(CategoryManagementCommands.UpdateCategory,
                new { req.CategoryID, req.Code, req.Name, req.IsActive, req.User, DeletedAt = deletedAt, req.DeletedBy });
        }

        public async Task<int> CreateClassification(ClassificationCreateRequest req)
        {
            return await QuerySingleAsync<int>(CategoryManagementCommands.CreateClassification, req);
        }

        public async Task UpdateClassification(ClassificationUpdateRequest req)
        {
            var deletedAt = req.IsDeleted == true ? DateTime.UtcNow : (DateTime?)null;
            await ExecuteAsync(CategoryManagementCommands.UpdateClassification,
                new { req.ClassificationID, req.CategoryID, req.Code, req.Name, req.IsActive, req.User, DeletedAt = deletedAt, req.DeletedBy });
        }

        public async Task<int> CreateSubClassification(SubClassificationCreateRequest req)
        {
            return await QuerySingleAsync<int>(CategoryManagementCommands.CreateSubClassification, req);
        }

        public async Task UpdateSubClassification(SubClassificationUpdateRequest req)
        {
            var deletedAt = req.IsDeleted == true ? DateTime.UtcNow : (DateTime?)null;
            await ExecuteAsync(CategoryManagementCommands.UpdateSubClassification,
                new { req.SubClassificationID, req.ClassificationID, req.Code, req.Name, req.IsActive, req.User, DeletedAt = deletedAt, req.DeletedBy });
        }
    }
}