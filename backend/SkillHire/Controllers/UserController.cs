using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHire.Data;
using SkillHire.Dtos;
using SkillHire.Models;

namespace SkillHire.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Surname = u.Surname,
                    PersonalNumber = u.PersonalNumber,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Worker,Client")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            return Ok(new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                PersonalNumber = user.PersonalNumber,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role
            });
        }

        // POST
        [HttpPost]
        public IActionResult CreateUser(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
        }

        // PUT
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto dto)
        {
            if (id != dto.Id) return BadRequest("ID mismatch.");

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            var roleNorm = (dto.Role ?? "").Trim().ToLowerInvariant();
            string? role = roleNorm switch
            {
                "client" => "Client",
                "worker" => "Worker",
                "admin" => "Admin",
                _ => null
            };
            if (role is null)
                return BadRequest("Role must be Client, Worker, or Admin.");

            var exists = await _context.Users.AnyAsync(u =>
                u.Id != id && (u.Username == dto.Username || u.Email == dto.Email));
            if (exists) return BadRequest("Username or Email already exists.");

            user.Name = dto.Name;
            user.Surname = dto.Surname;
            user.PersonalNumber = dto.PersonalNumber;
            user.Username = dto.Username;
            user.Email = dto.Email;
            user.Role = role;

            await _context.SaveChangesAsync();

            return Ok(new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                PersonalNumber = user.PersonalNumber,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role
            });
        }

        // DELETE
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id, [FromQuery] bool force = false)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            if (force)
            {
                var hires = await _context.Hires
                    .Where(h => h.ClientId == id || h.WorkerId == id)
                    .ToListAsync();
                if (hires.Count > 0)
                    _context.Hires.RemoveRange(hires);

                var profiles = await _context.WorkerProfiles
                    .Where(wp => wp.UserId == id)
                    .ToListAsync();
                if (profiles.Count > 0)
                {
                    var profileIds = profiles.Select(p => p.Id).ToList();

                    var workerServices = await _context.WorkerServices
                        .Where(ws => profileIds.Contains(ws.WorkerProfileId))
                        .ToListAsync();
                    if (workerServices.Count > 0)
                        _context.WorkerServices.RemoveRange(workerServices);

                    var workerPhotos = await _context.WorkerPhotos
                        .Where(wp => profileIds.Contains(wp.WorkerProfileId))
                        .ToListAsync();
                    if (workerPhotos.Count > 0)
                        _context.WorkerPhotos.RemoveRange(workerPhotos);

                    _context.WorkerProfiles.RemoveRange(profiles);
                }
            }

            _context.Users.Remove(user);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict("Unable to delete user with related records.");
            }

            return NoContent();
        }
    }
}
