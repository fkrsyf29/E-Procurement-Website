using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.RoleCategory;

namespace EProcurement.Api.Repositories.Implementations
{
    public class RoleCategoryRepository : DapperRepository, IRoleCategoryRepository
    {
        public RoleCategoryRepository(DbConnectionFactory connectionFactory)
            : base(connectionFactory)
        {
        }

        public async Task<IEnumerable<RoleCategoryDto>> GetAllAsync()
        {
            return await QueryAsync<RoleCategoryDto>(RoleCategoryQueries.GetAll);
        }
    }
}
