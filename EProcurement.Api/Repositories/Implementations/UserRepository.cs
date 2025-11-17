using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.Users;

namespace EProcurement.Api.Repositories.Implementations
{
    public class UserRepository : DapperRepository, IUserRepository
    {
        public UserRepository(DbConnectionFactory connectionFactory)
            : base(connectionFactory)
        {
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            return await QueryAsync<UserDto>(UserQueries.GetAll);
        }

        public async Task<UserDto?> GetByIdAsync(string UserId)
        {
            return await QuerySingleAsync<UserDto>(UserQueries.GetById, new { UserId = UserId });
        }

        public async Task<UserInsertResult> InsertAsync(UserCreateRequest req)
        {
            return await QuerySingleAsync<UserInsertResult>(UserCommands.Insert, new
            {
                req.Username,
                req.PasswordHash,
                req.Name,
                req.RoleID,
                req.JobsiteID,
                req.DepartmentID,
                req.Email,
                req.Phone,
                req.CreatedBy
            });
        }

        public async Task<UserUpdateResult> UpdateAsync(UserUpdateRequest req)
        {
            return await QuerySingleAsync<UserUpdateResult>(UserCommands.Update, new
            {
                req.UserID,
                req.Username,
                req.PasswordHash,
                req.Name,
                req.RoleID,
                req.JobsiteID,
                req.DepartmentID,
                req.Email,
                req.Phone,
                req.IsActive,
                req.UpdatedBy,
                req.IsDeleted,
                req.DeletedBy
            });
        }
    }
}
