using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.Permission;
using EProcurement.Api.SQL.Roles;

namespace EProcurement.Api.Repositories.Implementations
{
    public class PermissionRepository : DapperRepository, IPermissionRepository
    {
        public PermissionRepository(DbConnectionFactory connectionFactory)
            : base(connectionFactory)
        {
        }

        public async Task<IEnumerable<PermissionDto>> GetAllAsync()
        {
            return await QueryAsync<PermissionDto>(PermissionQueries.GetAll);
        }
    }
}
