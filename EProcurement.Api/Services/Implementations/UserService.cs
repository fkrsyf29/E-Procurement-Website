using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;

        public UserService(IUserRepository repo)
        {
            _repo = repo;
        }

        public Task<IEnumerable<UserDto>> GetAllAsync() => _repo.GetAllAsync();

        public Task<UserDto?> GetByIdAsync(string UserId) => _repo.GetByIdAsync(UserId);

        public Task<UserInsertResult> InsertAsync(UserCreateRequest request) => _repo.InsertAsync(request);

        public Task<UserUpdateResult> UpdateAsync(UserUpdateRequest request) => _repo.UpdateAsync(request);
    }
}
