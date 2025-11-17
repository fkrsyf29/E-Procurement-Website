using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllAsync();
        Task<UserDto?> GetByIdAsync(string UserId);
        Task<UserInsertResult> InsertAsync(UserCreateRequest request);
        Task<UserUpdateResult> UpdateAsync(UserUpdateRequest request);
    }
}
