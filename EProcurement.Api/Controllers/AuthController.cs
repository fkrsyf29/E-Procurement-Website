using EProcurement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using EProcurement.Api.DTOs.Requests;

namespace EProcurement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ISsoService _sso;

        public AuthController(ISsoService sso)
        {
            _sso = sso;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest req)
        {
            bool isAuth = await _sso.AuthenticateUser(req.UserID, req.Password);

            if (!isAuth)
                return Unauthorized(new { message = "Invalid username or password" });

            var user = await _sso.GetUserInfo(req.UserID);

            return Ok(new
            {
                success = true,
                message = "Login successful",
                user = user
            });
        }

        [HttpGet("userinfo/{username}")]
        public async Task<IActionResult> GetUserInfo(string username)
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

        [HttpGet("check")]
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

    }
}
