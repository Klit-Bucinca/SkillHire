using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHire.Data;
using SkillHire.Models;
using System.Text.Json;

namespace SkillHire.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkerPhotoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public WorkerPhotoController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env     = env;
        }

        // --------------------------------------------------------------------- //
        // GET: all photos (admin use)
        // --------------------------------------------------------------------- //
        [HttpGet]
        public async Task<IActionResult> GetWorkerPhotos()
        {
            var dtoList = await _context.WorkerPhotos
                .Select(p => new WorkerPhotoDto
                {
                    Id          = p.Id,
                    ImageUrl    = p.ImageUrl,
                    Description = p.Description
                })
                .ToListAsync();

            return Ok(dtoList);
        }

        // --------------------------------------------------------------------- //
        // GET: single photo
        // --------------------------------------------------------------------- //
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkerPhoto(int id)
        {
            var photo = await _context.WorkerPhotos.FindAsync(id);
            if (photo == null) return NotFound();

            return Ok(new WorkerPhotoDto
            {
                Id          = photo.Id,
                ImageUrl    = photo.ImageUrl,
                Description = photo.Description
            });
        }

        // --------------------------------------------------------------------- //
        // GET: all photos for a specific worker profile
        // --------------------------------------------------------------------- //
        [HttpGet("by-profile/{workerProfileId}")]
        public async Task<IActionResult> GetPhotosByWorkerProfile(int workerProfileId)
        {
            var dtoList = await _context.WorkerPhotos
                .Where(p => p.WorkerProfileId == workerProfileId)
                .Select(p => new WorkerPhotoDto
                {
                    Id          = p.Id,
                    ImageUrl    = p.ImageUrl,
                    Description = p.Description
                })
                .ToListAsync();

            return Ok(dtoList);
        }

        // --------------------------------------------------------------------- //
        // POST: create (single)  — rarely used because upload handles most cases
        // --------------------------------------------------------------------- //
        [HttpPost]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> CreateWorkerPhoto([FromBody] WorkerPhotoDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entity = new WorkerPhoto
            {
                WorkerProfileId = dto.WorkerProfileId,
                ImageUrl        = dto.ImageUrl,
                Description     = dto.Description
            };

            _context.WorkerPhotos.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.Id;
            return CreatedAtAction(nameof(GetWorkerPhoto), new { id = dto.Id }, dto);
        }

        // --------------------------------------------------------------------- //
        // PUT: update description
        // --------------------------------------------------------------------- //
        [HttpPut("{id}")]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> UpdateWorkerPhoto(int id, [FromBody] WorkerPhotoDto dto)
        {
            if (id != dto.Id) return BadRequest();

            var entity = await _context.WorkerPhotos.FindAsync(id);
            if (entity == null) return NotFound();

            entity.Description = dto.Description;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // --------------------------------------------------------------------- //
        // DELETE
        // --------------------------------------------------------------------- //
        [HttpDelete("{id}")]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> DeleteWorkerPhoto(int id)
        {
            var photo = await _context.WorkerPhotos.FindAsync(id);
            if (photo == null) return NotFound();

            _context.WorkerPhotos.Remove(photo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // --------------------------------------------------------------------- //
        // POST: upload multiple photos for a worker profile
        // --------------------------------------------------------------------- //
        [HttpPost("{workerProfileId}/upload")]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> UploadWorkerPhotos(
            int workerProfileId,
            [FromForm] IFormCollection form)
        {
            var profile = await _context.WorkerProfiles.FindAsync(workerProfileId);
            if (profile == null) return NotFound("Worker profile not found.");

            // ----------------------------------------------------------------- //
            // 1. Parse incoming form data
            // ----------------------------------------------------------------- //
            var files           = form.Files;
            var descriptionsRaw = form["descriptions"];

            if (files is null || files.Count == 0)
                return BadRequest("No files uploaded.");

            List<string?> descriptions = new();
            if (!string.IsNullOrEmpty(descriptionsRaw))
            {
                try
                {
                    descriptions =
                        JsonSerializer.Deserialize<List<string?>>(descriptionsRaw)!;
                }
                catch
                {
                    return BadRequest(
                        "Invalid descriptions format. Must be a JSON array of strings.");
                }
            }

            if (descriptions.Count != 0 && descriptions.Count != files.Count)
                return BadRequest("Descriptions count must match the number of files.");

            // ----------------------------------------------------------------- //
            // 2. Save every file to /wwwroot/uploads/worker-photos
            // ----------------------------------------------------------------- //
            var uploadDir = Path.Combine(_env.WebRootPath, "uploads", "worker-photos");
            Directory.CreateDirectory(uploadDir);

            var uploadedEntities = new List<WorkerPhoto>();

            for (int i = 0; i < files.Count; i++)
            {
                var file        = files[i];
                var description = descriptions.Count > 0 ? descriptions[i] : null;

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadDir, fileName);

                await using var stream = new FileStream(filePath, FileMode.Create);
                await file.CopyToAsync(stream);

                var entity = new WorkerPhoto
                {
                    WorkerProfileId = workerProfileId,
                    ImageUrl        = $"/uploads/worker-photos/{fileName}",
                    Description     = description
                };

                _context.WorkerPhotos.Add(entity);
                uploadedEntities.Add(entity);
            }

            await _context.SaveChangesAsync();

            // ----------------------------------------------------------------- //
            // 3. Map entities → DTOs to avoid cyclic-reference serialization
            // ----------------------------------------------------------------- //
            var dtoList = uploadedEntities.Select(e => new WorkerPhotoDto
            {
                Id          = e.Id,
                ImageUrl    = e.ImageUrl,
                Description = e.Description
            });

            return Ok(new
            {
                message = "Worker photos uploaded successfully.",
                photos  = dtoList
            });
        }
    }
}
