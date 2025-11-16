using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.Repositories.Interfaces;

namespace EProcurement.Api.Repositories.Implementations
{
    public class DapperRepository : BaseRepository, IQueryRepository, ICommandRepository
    {
        public DapperRepository(DbConnectionFactory factory)
            : base(factory)
        {
        }

        public async Task<T?> QuerySingleAsync<T>(string sql, object? param = null)
        {
            using var conn = CreateConnection();
            return await conn.QuerySingleOrDefaultAsync<T>(sql, param);
        }

        public async Task<IEnumerable<T>> QueryAsync<T>(string sql, object? param = null)
        {
            using var conn = CreateConnection();
            return await conn.QueryAsync<T>(sql, param);
        }

        public async Task<int> ExecuteAsync(string sql, object? param = null)
        {
            using var conn = CreateConnection();
            return await conn.ExecuteAsync(sql, param);
        }
    }

}
