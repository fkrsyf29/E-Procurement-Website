using Azure.Core;
using EProcurement.Api.Authentication;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.Entities;
using EProcurement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ISsoService _sso;
        private readonly IUserService _userService;
        private readonly IJwtService _jwtService;
        public AuthController(ISsoService sso, IUserService userService, IJwtService jwtService)
        {
            _sso = sso;
            _userService = userService;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest req)
        {
            bool isAuth = await _sso.AuthenticateUser(req.Username, req.Password);

            if (!isAuth)
                return Unauthorized(new { message = "Invalid username or password" });
            var result = await _userService.GetByNameAsync(req.Username);
            if (result == null) return NotFound();

            var extraClaims = new Dictionary<string, string>
            {
                { ClaimTypes.Name, req.Username },
                { "role", result.RoleName }
            };

            var accessToken = _jwtService.GenerateToken(result.UserID.ToString(), extraClaims);
            var refreshToken = await _userService.GenerateRefreshToken(result.UserID.ToString());

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true, // Melindungi dari XSS
                Secure = true,   // Wajib HTTPS = true
                SameSite = SameSiteMode.Strict, // Perlindungan CSRF = .Strict
                Expires = DateTimeOffset.Now.AddDays(7) // Contoh 7 hari
            };
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);

            return Ok(new
            {
                success = true,
                accessToken = accessToken,
                expiresIn = (int)TimeSpan.FromMinutes(60).TotalSeconds,
                user = result
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized(new { message = "Refresh token required." });
            }

            var user = await _userService.ValidateAndGetByRefreshTokenAsync(refreshToken);

            if (user == null)
            {
                Response.Cookies.Delete("refreshToken");
                return Unauthorized(new { message = "Invalid or expired refresh token. Please login again." });
            }

            var extraClaims = new Dictionary<string, string>
            {
                { ClaimTypes.Name, user.Username },
                { "role", user.RoleName }
            };
            var newAccessToken = _jwtService.GenerateToken(user.UserID.ToString(), extraClaims);

            var newRefreshToken = await _userService.GenerateRefreshToken(user.UserID.ToString());

            var cookieOptions = new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict, Expires = DateTimeOffset.Now.AddDays(7) };
            Response.Cookies.Append("refreshToken", newRefreshToken, cookieOptions);

            return Ok(new
            {
                success = true,
                accessToken = newAccessToken
            });
        }

        [HttpGet("userinfo-sso/{username}")]
        public async Task<IActionResult> GetUserInfoSSO(string username)
        {
            if (string.IsNullOrEmpty(username))
                return BadRequest(new { message = "Username required" });

            var user = await _sso.GetUserInfo(username);

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                success = true,
                user = user
            });
        }

        [HttpGet("check-sso")]
        public async Task<IActionResult> Check()
        {
            try
            {
                bool isAlive = await _sso.Ping();

                if (isAlive)
                    return Ok(new
                    {
                        status = "OK",
                        message = "SSO service is reachable"
                    });

                return StatusCode(503, new
                {
                    status = "ERROR",
                    message = "SSO service unreachable or returned unexpected result"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "ERROR",
                    message = "Exception while connecting to SSO",
                    details = ex.Message
                });
            }
        }

        [HttpGet("userinfo")] 
        [Authorize] 
        public async Task<IActionResult> GetUserInfo()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User ID not found in token claims." });
            }

            string userId = userIdClaim.Value;

            var user = await _userService.GetByIdAsync(userId); // Menggunakan GetByIdAsync

            if (user == null)
            {
                return NotFound(new { message = "User data not found." });
            }

            return Ok(new
            {
                success = true,
                user = user
            });
        }


    }
}
