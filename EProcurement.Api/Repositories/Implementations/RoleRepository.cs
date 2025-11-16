using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.Roles;

namespace EProcurement.Api.Repositories.Implementations
{
    public class RoleRepository : BaseRepository, IRoleRepository
    {
        public RoleRepository(DbConnectionFactory factory)
            : base(factory)
        {
        }

        public async Task<IEnumerable<Role>> GetAll()
        {
            using var conn = CreateConnection();
            return await conn.QueryAsync<Role>(RoleQueries.GetAll);
        }

        public async Task<Role?> GetById(int id)
        {
            using var conn = CreateConnection();
            return await conn.QuerySingleOrDefaultAsync<Role>(
                RoleQueries.GetById,
                new { Id = id }
            );
        }

        public async Task<int> Insert(Role role)
        {
            using var conn = CreateConnection();
            return await conn.ExecuteAsync(
                RoleCommands.Insert,
                new
                {
                    role.Name,
                    role.Description,
                    role.CanApprove,
                    role.CanCreate,
                    role.CanView,
                    role.Role_Category_Id,
                    role.IsActive,
                    role.IsSystemGenerated,
                    createdDate = DateTime.Now
                }
            );
        }

        public async Task<int> Update(Role role)
        {
            using var conn = CreateConnection();
            return await conn.ExecuteAsync(
                RoleCommands.Update,
                new
                {
                    role.Id,
                    role.Name,
                    role.Description,
                    role.CanApprove,
                    role.CanCreate,
                    role.CanView,
                    role.Role_Category_Id,
                    role.IsActive,
                    role.IsSystemGenerated
                }
            );
        }

        public async Task<int> Delete(int id)
        {
            using var conn = CreateConnection();
            return await conn.ExecuteAsync(
                RoleCommands.Delete,
                new { Id = id }
            );
        }
    }
}
