using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;

public class MatrixCategoryRepository : IMatrixCategoryRepository
{
    private readonly string _connStr;

    public MatrixCategoryRepository(IConfiguration config)
    {
        _connStr = config.GetConnectionString("DefaultConnection");
    }

    private IDbConnection Connection => new SqlConnection(_connStr);

    public async Task<IEnumerable<MatrixCategoryDto>> GetAllAsync()
    {
        var sql = "EXEC sp_GetCategoryHierarchy";

        using var conn = Connection;

        var rows = await conn.QueryAsync(sql);

        var categories = new Dictionary<int, MatrixCategoryDto>();

        foreach (var row in rows)
        {
            // 1. CATEGORY
            if (!categories.TryGetValue((int)row.CategoryID, out var cat))
            {
                cat = new MatrixCategoryDto
                {
                    CategoryID = row.CategoryID,
                    Code = row.CategoryCode,
                    Name = row.CategoryName,
                    Classifications = new List<MatrixClassificationDto>()
                };

                categories.Add(cat.CategoryID, cat);
            }

            // 2. CLASSIFICATION
            if (row.ClassificationID != null)
            {
                var existingClass = cat.Classifications
                    .FirstOrDefault(x => x.ClassificationID == row.ClassificationID);

                if (existingClass == null)
                {
                    existingClass = new MatrixClassificationDto
                    {
                        ClassificationID = row.ClassificationID,
                        CategoryID = row.CategoryID,
                        Code = row.ClassificationCode,
                        Name = row.ClassificationName,
                        SubClassifications = new List<MatrixSubClassificationDto>()
                    };

                    cat.Classifications.Add(existingClass);
                }

                // 3. SUB-CLASSIFICATION
                if (row.SubClassificationID != null)
                {
                    existingClass.SubClassifications.Add(new MatrixSubClassificationDto
                    {
                        SubClassificationID = row.SubClassificationID,
                        ClassificationID = row.ClassificationID,
                        Code = row.SubClassificationCode,
                        Name = row.SubClassificationName
                    });
                }
            }
        }

        return categories.Values;
    }
}
