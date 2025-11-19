using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllAsync();
        Task<UserDto?> GetByIdAsync(string UserId);
        Task<UserDto?> GetByNameAsync(string UserName);
        Task<UserInsertResult> InsertAsync(UserCreateRequest request);
        Task<UserUpdateResult> UpdateAsync(UserUpdateRequest request);
        Task<string> GenerateRefreshToken(string userId);
        Task<UserDto?> ValidateAndGetByRefreshTokenAsync(string refreshToken);
    }
}
