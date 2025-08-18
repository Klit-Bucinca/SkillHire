using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHire.Data;
using SkillHire.Models;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;


namespace SkillHire.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username || u.Email == request.Username);

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
                return Unauthorized("Invalid username or password.");

            var token = CreateJwtToken(user);

            return Ok(new
            {
                token,
                user.Id,
                user.Username,
                user.Email,
                user.Role
            });
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            var hash = HashPassword(password);
            return hash == hashedPassword;
        }

        private string CreateJwtToken(User user)
        {
            var claims = new[]
            {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.Role, user.Role)
    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: null,
                audience: null,
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public class UserLoginDto
        {
            public string Username { get; set; } 
            public string Password { get; set; }
        }

        // POST:
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto request)
        {
            
            var roleNorm = (request.Role ?? "").Trim().ToLowerInvariant();
            string? role = roleNorm switch
            {
                "client" => "Client",
                "worker" => "Worker",
                "admin" => "Admin",
                _ => null
            };
            if (role is null)
                return BadRequest("Role must be Client, Worker, or Admin.");

           
            if (await _context.Users.AnyAsync(u => u.Email == request.Email || u.Username == request.Username))
                return BadRequest("Username or Email already exists.");

           
            var hashedPassword = HashPassword(request.Password);
            var user = new User
            {
                Name = request.Name,
                Surname = request.Surname,
                PersonalNumber = request.PersonalNumber,
                Username = request.Username,
                Email = request.Email,
                PasswordHash = hashedPassword,
                Role = role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            
            if (role == "Worker")
            {
                var workerProfile = new WorkerProfile
                {
                    UserId = user.Id,
                    Phone = "",
                    City = "",
                    YearsExperience = 0,
                    ProfilePhoto = "/uploads/profile-photos/default.jpg"
                };

                _context.WorkerProfiles.Add(workerProfile);
                await _context.SaveChangesAsync();
            }

            
            return Ok(new
            {
                message = "User registered successfully.",
                user.Id,
                user.Username,
                user.Email,
                user.Role
            });
        }


        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }

    public class UserRegisterDto
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string PersonalNumber { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } 
    }
}
