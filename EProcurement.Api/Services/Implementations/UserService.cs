using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;
using System.Security.Cryptography;

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
        public Task<UserDto?> GetByNameAsync(string UserName) => _repo.GetByNameAsync(UserName);

        public Task<UserInsertResult> InsertAsync(UserCreateRequest request) => _repo.InsertAsync(request);

        public Task<UserUpdateResult> UpdateAsync(UserUpdateRequest request) => _repo.UpdateAsync(request);

        public async Task<string> GenerateRefreshToken(string userId)
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            var refreshToken = Convert.ToBase64String(randomNumber);

            var expirationDate = DateTime.UtcNow.AddDays(7); // Contoh 7 hari

            await _repo.SetRefreshTokenAsync(userId, refreshToken, expirationDate);

            return refreshToken;
        }

        public async Task<UserDto?> ValidateAndGetByRefreshTokenAsync(string refreshToken)
        {
            var user = await _repo.GetByRefreshTokenAsync(refreshToken);

            return user;
        }
    }
}
