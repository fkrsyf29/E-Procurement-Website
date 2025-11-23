using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Connections;
using System.Data;

namespace EProcurement.Api.Repositories.Implementations
{
    public class CategoryRepository : DapperRepository, ICategoryRepository
    {
        // 1. Tambahkan field ini
        private readonly DbConnectionFactory _connectionFactory;

        public CategoryRepository(DbConnectionFactory connectionFactory) : base(connectionFactory)
        {
            // 2. Assign nilai dari constructor ke field lokal
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllHierarchyAsync()
        {
            // Sekarang _connectionFactory sudah dikenali
            using var connection = _connectionFactory.CreateConnection();

            // Menggunakan QueryMultiple untuk memanggil SP yang mengembalikan 3 result sets
            using var multi = await connection.QueryMultipleAsync("EXEC SP_Category_GetAllHierarchy");

            var categories = (await multi.ReadAsync<CategoryDto>()).ToList();
            var classifications = (await multi.ReadAsync<ClassificationDto>()).ToList();
            var subClassifications = (await multi.ReadAsync<SubClassificationDto>()).ToList();

            // Menyusun Hierarki (In-Memory mapping)
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

        // --- CATEGORY CRUD ---
        public async Task<int> CreateCategory(CategoryCreateRequest req)
        {
            return await QuerySingleAsync<int>("EXEC SP_Category_Insert @Code, @Name, @IsActive, @User", req);
        }
        public async Task UpdateCategory(CategoryUpdateRequest req)
        {
            var deletedAt = req.IsDeleted == true ? DateTime.UtcNow : (DateTime?)null;
            await ExecuteAsync("EXEC SP_Category_Update @CategoryID, @Code, @Name, @IsActive, @User, @DeletedAt, @DeletedBy",
                new { req.CategoryID, req.Code, req.Name, req.IsActive, req.User, DeletedAt = deletedAt, req.DeletedBy });
        }

        // --- CLASSIFICATION CRUD ---
        public async Task<int> CreateClassification(ClassificationCreateRequest req)
        {
            return await QuerySingleAsync<int>("EXEC SP_Classification_Insert @CategoryID, @Code, @Name, @IsActive, @User", req);
        }
        public async Task UpdateClassification(ClassificationUpdateRequest req)
        {
            var deletedAt = req.IsDeleted == true ? DateTime.UtcNow : (DateTime?)null;
            await ExecuteAsync("EXEC SP_Classification_Update @ClassificationID, @CategoryID, @Code, @Name, @IsActive, @User, @DeletedAt, @DeletedBy",
                new { req.ClassificationID, req.CategoryID, req.Code, req.Name, req.IsActive, req.User, DeletedAt = deletedAt, req.DeletedBy });
        }

        // --- SUBCLASSIFICATION CRUD ---
        public async Task<int> CreateSubClassification(SubClassificationCreateRequest req)
        {
            return await QuerySingleAsync<int>("EXEC SP_SubClassification_Insert @ClassificationID, @Code, @Name, @IsActive, @User", req);
        }
        public async Task UpdateSubClassification(SubClassificationUpdateRequest req)
        {
            var deletedAt = req.IsDeleted == true ? DateTime.UtcNow : (DateTime?)null;
            await ExecuteAsync("EXEC SP_SubClassification_Update @SubClassificationID, @ClassificationID, @Code, @Name, @IsActive, @User, @DeletedAt, @DeletedBy",
                new { req.SubClassificationID, req.ClassificationID, req.Code, req.Name, req.IsActive, req.User, DeletedAt = deletedAt, req.DeletedBy });
        }
    }
}