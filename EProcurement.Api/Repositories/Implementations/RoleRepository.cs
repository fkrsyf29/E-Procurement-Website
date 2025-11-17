using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.Roles;

namespace EProcurement.Api.Repositories.Implementations
{
    public class RoleRepository : DapperRepository, IRoleRepository
    {
        public RoleRepository(DbConnectionFactory connectionFactory)
            : base(connectionFactory)
        {
        }

        public async Task<IEnumerable<RoleDto>> GetAllAsync()
        {
            return await QueryAsync<RoleDto>(UserQueries.GetAll);
        }

        public async Task<RoleDto?> GetByIdAsync(string roleId)
        {
            return await QuerySingleAsync<RoleDto>(UserQueries.GetById, new { RoleId = roleId });
        }

        public async Task<RoleInsertResult> InsertAsync(RoleCreateRequest req)
        {
            return await QuerySingleAsync<RoleInsertResult>(UserCommands.Insert, new
            {
                req.Name,
                req.Description,
                req.RoleCategoryId,
                req.ApprovalRoleId,
                req.CanApprove,
                req.CanCreate,
                req.CanView,
                req.IsActive,
                req.IsSystemGenerated,
                req.CreatedBy,
                PermissionIds = string.Join(",", req.PermissionIds)
            });
        }

        public async Task<RoleUpdateResult> UpdateAsync(RoleUpdateRequest req)
        {
            return await QuerySingleAsync<RoleUpdateResult>(UserCommands.Update, new
            {
                req.RoleId,
                req.Name,
                req.Description,
                req.RoleCategoryId,
                req.ApprovalRoleId,
                req.CanApprove,
                req.CanCreate,
                req.CanView,
                req.IsActive,
                req.UpdatedBy,
                PermissionIds = string.Join(",", req.PermissionIds),
                req.IsDeleted,
                req.DeletedBy
            });
        }
    }
}
