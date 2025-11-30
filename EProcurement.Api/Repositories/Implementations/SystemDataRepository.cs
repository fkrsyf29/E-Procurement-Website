using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.Repositories.Interfaces;
using System.Data;

namespace EProcurement.Api.Repositories.Implementations
{
    public class SystemDataRepository : ISystemDataRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public SystemDataRepository(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // Helper untuk membuat koneksi
        private IDbConnection CreateConnection()
        {
            return _connectionFactory.CreateConnection();
        }

        public async Task<IEnumerable<dynamic>> GetFlatSystemDataAsync()
        {
            using var db = CreateConnection();
            return await db.QueryAsync("usp_GetSystemDataList", commandType: CommandType.StoredProcedure);
        }

        public async Task<bool> CreateAsync(string categoryCode, string code, string name, string description, bool isActive, string user)
        {
            string tableName = GetTableName(categoryCode);
            if (string.IsNullOrEmpty(tableName)) return false;

            using var db = CreateConnection();

            // Mendapatkan Max OrderNo
            string sqlOrder = $"SELECT ISNULL(MAX(OrderNo), 0) + 1 FROM {tableName}";
            int newOrder = await db.ExecuteScalarAsync<int>(sqlOrder);

            string sql = $@"
                INSERT INTO {tableName} (Code, Name, Description, IsActive, OrderNo, CreatedBy, CreatedAt)
                VALUES (@Code, @Name, @Description, @IsActive, @OrderNo, @User, GETDATE())";

            try
            {
                var rows = await db.ExecuteAsync(sql, new { Code = code, Name = name, Description = description, IsActive = isActive, OrderNo = newOrder, User = user });
                return rows > 0;
            }
            catch
            {
                // Fallback jika tabel tidak punya kolom Description
                string sqlNoDesc = $@"
                    INSERT INTO {tableName} (Code, Name, IsActive, OrderNo, CreatedBy, CreatedAt)
                    VALUES (@Code, @Name, @IsActive, @OrderNo, @User, GETDATE())";
                var rows = await db.ExecuteAsync(sqlNoDesc, new { Code = code, Name = name, IsActive = isActive, OrderNo = newOrder, User = user });
                return rows > 0;
            }
        }

        public async Task<bool> UpdateAsync(string categoryCode, string code, string name, string description, bool isActive, string user)
        {
            string tableName = GetTableName(categoryCode);
            if (string.IsNullOrEmpty(tableName)) return false;

            using var db = CreateConnection();

            string sql = $@"
                UPDATE {tableName} 
                SET Name = @Name, 
                    Description = @Description, 
                    IsActive = @IsActive,
                    UpdatedBy = @User,
                    UpdatedAt = GETDATE()
                WHERE Code = @Code";

            try
            {
                var rows = await db.ExecuteAsync(sql, new { Code = code, Name = name, Description = description, IsActive = isActive, User = user });
                return rows > 0;
            }
            catch
            {
                string sqlNoDesc = $@"
                    UPDATE {tableName} 
                    SET Name = @Name, 
                        IsActive = @IsActive,
                        UpdatedBy = @User,
                        UpdatedAt = GETDATE()
                    WHERE Code = @Code";
                var rows = await db.ExecuteAsync(sqlNoDesc, new { Code = code, Name = name, IsActive = isActive, User = user });
                return rows > 0;
            }
        }

        public async Task<bool> DeleteAsync(string categoryCode, string code, string user)
        {
            string tableName = GetTableName(categoryCode);
            if (string.IsNullOrEmpty(tableName)) return false;

            using var db = CreateConnection();
            string sql = $@"
                UPDATE {tableName} 
                SET DeletedAt = GETDATE(),
                    DeletedBy = @User,
                    IsActive = 0
                WHERE Code = @Code";

            try
            {
                var rows = await db.ExecuteAsync(sql, new { Code = code, User = user });
                return rows > 0;
            }
            catch
            {
                string sqlNoDesc = $@"
                UPDATE {tableName} 
                SET DeletedAt = GETDATE(),
                    DeletedBy = 'SYSTEM TEST',
                    IsActive = 0
                WHERE Code = @Code";
                var rows = await db.ExecuteAsync(sqlNoDesc, new { Code = code});
                return rows > 0;
            }
        }

        public async Task<bool> ReorderAsync(string categoryCode, List<string> orderedIds)
        {
            string tableName = GetTableName(categoryCode);
            if (string.IsNullOrEmpty(tableName)) return false;

            if (orderedIds == null || !orderedIds.Any()) return false;

            using var db = CreateConnection();
            var sqlBuilder = new System.Text.StringBuilder();

            sqlBuilder.Append($"UPDATE {tableName} SET OrderNo = CASE Code ");

            var parameters = new DynamicParameters();
            for (int i = 0; i < orderedIds.Count; i++)
            {
                string paramName = $"@id{i}";
                sqlBuilder.Append($"WHEN {paramName} THEN {i + 1} ");
                parameters.Add(paramName, orderedIds[i]);
            }

            sqlBuilder.Append("END WHERE Code IN (");
            sqlBuilder.Append(string.Join(",", orderedIds.Select((_, i) => $"@id{i}")));
            sqlBuilder.Append(")");

            var rows = await db.ExecuteAsync(sqlBuilder.ToString(), parameters);
            return rows > 0;
        }

        private string GetTableName(string categoryCode)
        {
            return categoryCode switch
            {
                "jobsite" => "dbo.Jobsite",
                "department" => "dbo.Department",
                "workLocation" => "dbo.WorkLocation",
                "contractType" => "dbo.ContractType",
                "contractualType" => "dbo.ContractualType",
                "userRole" => "dbo.Role",
                "fundingSource" => "dbo.FundingSource",
                "uom" => "dbo.UOM",
                "kbli" => "dbo.KBLI",
                "externalBrand" => "dbo.ExternalBrand",
                "valuationClass" => "dbo.ValuationClass",
                "materialGroup" => "dbo.MaterialGroup",
                _ => null
            };
        }
    }
}