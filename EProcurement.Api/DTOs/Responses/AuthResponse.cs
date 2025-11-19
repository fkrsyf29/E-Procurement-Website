namespace EProcurement.Api.DTOs.Responses
{
    public class AuthResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
    }
}
