using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace EProcurement.Api.Authentication
{
    public interface IJwtService
    {
        string GenerateToken(IEnumerable<Claim> claims);
        string GenerateToken(string userId, IDictionary<string, string>? extraClaims = null);
        ClaimsPrincipal? ValidateToken(string token, out SecurityToken? validatedToken);
    }
}
