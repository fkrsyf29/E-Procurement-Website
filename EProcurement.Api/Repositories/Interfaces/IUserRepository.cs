using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<UserDto>> GetAllAsync();
        Task<UserDto?> GetByIdAsync(string UserId);
        Task<UserInsertResult> InsertAsync(UserCreateRequest req);
        Task<UserUpdateResult> UpdateAsync(UserUpdateRequest req);
    }
}
