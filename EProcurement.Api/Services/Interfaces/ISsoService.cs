using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface ISsoService
    {
        Task<bool> AuthenticateUser(string username, string password);
        Task<UserInfoDto?> GetUserInfo(string username);
        Task<bool> Ping();

    }
}
