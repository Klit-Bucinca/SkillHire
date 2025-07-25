using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHire.Data;
using SkillHire.Models;

namespace SkillHire.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkerProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public WorkerProfileController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET
        [HttpGet]
        public async Task<IActionResult> GetWorkerProfiles()
        {
            var profiles = await _context.WorkerProfiles
                .Include(wp => wp.User)
                .Include(wp => wp.WorkerServices).ThenInclude(ws => ws.Service)
                .Include(wp => wp.WorkerPhotos)
                .ToListAsync();

            var dtoList = profiles.Select(profile => new WorkerProfileDto
            {
                Id = profile.Id,
                UserId = profile.UserId,
                City = profile.City,
                Phone = profile.Phone,
                YearsExperience = profile.YearsExperience,
                ProfilePhoto = profile.ProfilePhoto,
                Services = profile.WorkerServices?
                    .Select(ws => ws.Service.Name)
                    .ToList() ?? new List<string>(),
                Photos = profile.WorkerPhotos?
                    .Select(p => new WorkerPhotoDto
                    {
                        Id = p.Id,
                        ImageUrl = p.ImageUrl,
                        Description = p.Description
                    })
                    .ToList() ?? new List<WorkerPhotoDto>()
            }).ToList();

            return Ok(dtoList);
        }

        // GET
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkerProfile(int id)
        {
            var profile = await _context.WorkerProfiles
                .Include(wp => wp.User)
                .Include(wp => wp.WorkerServices).ThenInclude(ws => ws.Service)
                .Include(wp => wp.WorkerPhotos)
                .FirstOrDefaultAsync(wp => wp.Id == id);

            if (profile == null) return NotFound();

            var dto = new WorkerProfileDto
            {
                Id = profile.Id,
                UserId = profile.UserId,
                City = profile.City,
                Phone = profile.Phone,
                YearsExperience = profile.YearsExperience,
                ProfilePhoto = profile.ProfilePhoto,
                Services = profile.WorkerServices?
                    .Select(ws => ws.Service.Name)
                    .ToList() ?? new List<string>(),
                Photos = profile.WorkerPhotos?
                    .Select(p => new WorkerPhotoDto
                    {
                        Id = p.Id,
                        ImageUrl = p.ImageUrl,
                        Description = p.Description
                    })
                    .ToList() ?? new List<WorkerPhotoDto>()
            };

            return Ok(dto);
        }

        // POST
        [HttpPost]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> CreateWorkerProfile([FromBody] WorkerProfile profile)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.WorkerProfiles.Add(profile);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWorkerProfile), new { id = profile.Id }, profile);
        }

        // PUT
        [HttpPut("{id}")]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> UpdateWorkerProfile(int id, [FromBody] WorkerProfile profile)
        {
            if (id != profile.Id) return BadRequest();

            _context.Entry(profile).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.WorkerProfiles.Any(wp => wp.Id == id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE
        [HttpDelete("{id}")]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> DeleteWorkerProfile(int id)
        {
            var profile = await _context.WorkerProfiles.FindAsync(id);
            if (profile == null) return NotFound();

            _context.WorkerProfiles.Remove(profile);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST
        [HttpPost("{id}/upload-photo")]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> UploadProfilePhoto(int id, IFormFile file)
        {
            var profile = await _context.WorkerProfiles.FindAsync(id);
            if (profile == null) return NotFound("Worker profile not found.");

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadPath = Path.Combine(_env.WebRootPath, "uploads", "profile-photos");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            profile.ProfilePhoto = $"/uploads/profile-photos/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile photo uploaded successfully.",
                photoUrl = profile.ProfilePhoto
            });
        }
    }
}
