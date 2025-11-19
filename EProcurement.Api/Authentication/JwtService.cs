using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace EProcurement.Api.Authentication
{
    public class JwtService : IJwtService
    {
        private readonly JwtSettings _settings;
        private readonly byte[] _key;

        public JwtService(IOptions<JwtSettings> options)
        {
            _settings = options.Value;
            _key = Encoding.UTF8.GetBytes(_settings.SecretKey);
        }

        public string GenerateToken(IEnumerable<Claim> claims)
        {
            var now = DateTime.UtcNow;
            var expires = now.AddMinutes(_settings.AccessTokenExpirationMinutes);


            var signingCredentials = new SigningCredentials(new SymmetricSecurityKey(_key), SecurityAlgorithms.HmacSha256);


            var jwt = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: now,
            expires: expires,
            signingCredentials: signingCredentials
            );


            return new JwtSecurityTokenHandler().WriteToken(jwt);
        }

        public string GenerateToken(string userId, IDictionary<string, string>? extraClaims = null)
        {
            var claims = new List<Claim>
            {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, userId)
            };

            if (extraClaims != null)
            {
                foreach (var kv in extraClaims)
                    claims.Add(new Claim(kv.Key, kv.Value));
            }
            return GenerateToken(claims);
        }

        public ClaimsPrincipal? ValidateToken(string token, out SecurityToken? validatedToken)
        {
            validatedToken = null;


            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _settings.Issuer,
                ValidateAudience = true,
                ValidAudience = _settings.Audience,
                ValidateLifetime = true,
                IssuerSigningKey = new SymmetricSecurityKey(_key),
                ValidateIssuerSigningKey = true,
                ClockSkew = TimeSpan.FromSeconds(30)
            };


            try
            {
                var principal = tokenHandler.ValidateToken(token, validationParameters, out validatedToken);
                return principal;
            }
            catch
            {
                return null;
            }
        }
    }
}
