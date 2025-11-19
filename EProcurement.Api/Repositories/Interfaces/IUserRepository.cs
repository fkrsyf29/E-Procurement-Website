using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<UserDto>> GetAllAsync();
        Task<UserDto?> GetByIdAsync(string UserId);
        Task<UserDto?> GetByNameAsync(string UserName);
        Task<UserInsertResult> InsertAsync(UserCreateRequest req);
        Task<UserUpdateResult> UpdateAsync(UserUpdateRequest req);
        Task SetRefreshTokenAsync(string userId, string refreshToken, DateTime expiryDate);
        Task<UserDto?> GetByRefreshTokenAsync(string refreshToken);
    }
}
