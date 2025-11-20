using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.PermissionCategory;

namespace EProcurement.Api.Repositories.Implementations
{
    public class PermissionCategoryRepository : DapperRepository, IPermissionCategoryRepository
    {
        public PermissionCategoryRepository(DbConnectionFactory connectionFactory)
            : base(connectionFactory)
        {
        }

        public async Task<IEnumerable<PermissionCategoryDto>> GetAllAsync()
        {
            return await QueryAsync<PermissionCategoryDto>(PermissionCategoryQueries.GetAll);
        }
    }
}
