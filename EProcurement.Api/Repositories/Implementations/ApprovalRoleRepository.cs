using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.ApprovalRole;

namespace EProcurement.Api.Repositories.Implementations
{
    public class ApprovalRoleRepository : DapperRepository, IApprovalRoleRepository
    {
        public ApprovalRoleRepository(DbConnectionFactory connectionFactory)
            : base(connectionFactory)
        {
        }

        public async Task<IEnumerable<ApprovalRoleDto>> GetAllAsync()
        {
            return await QueryAsync<ApprovalRoleDto>(ApprovalRoleQueries.GetAll);
        }
    }
}
