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
            _env = env;
        }

        // GET
        [HttpGet]
        public async Task<IActionResult> GetWorkerPhotos()
        {
            var photos = await _context.WorkerPhotos
                .Include(wp => wp.WorkerProfile) 
                .ToListAsync();

            return Ok(photos);
        }



        // GET id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkerPhoto(int id)
        {
            var photo = await _context.WorkerPhotos
                .Include(wp => wp.WorkerProfile)
                .FirstOrDefaultAsync(wp => wp.Id == id);

            if (photo == null) return NotFound();
            return Ok(photo);
        }

        //Get all photos for a specific worker profile
        [HttpGet("by-profile/{workerProfileId}")]
        public async Task<IActionResult> GetPhotosByWorkerProfile(int workerProfileId)
        {
            var profile = await _context.WorkerProfiles.FindAsync(workerProfileId);
            if (profile == null) return NotFound("Worker profile not found.");

            var photos = await _context.WorkerPhotos
                .Where(wp => wp.WorkerProfileId == workerProfileId)
                .ToListAsync();

            return Ok(photos);
        }


        // POST
        [HttpPost]
        public async Task<IActionResult> CreateWorkerPhoto([FromBody] WorkerPhoto photo)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.WorkerPhotos.Add(photo);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWorkerPhoto), new { id = photo.Id }, photo);
        }

        // PUT
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkerPhoto(int id, [FromBody] WorkerPhoto photo)
        {
            if (id != photo.Id) return BadRequest();

            _context.Entry(photo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.WorkerPhotos.Any(wp => wp.Id == id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE:
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkerPhoto(int id)
        {
            var photo = await _context.WorkerPhotos.FindAsync(id);
            if (photo == null) return NotFound();

            _context.WorkerPhotos.Remove(photo);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        // POST multiple
        [HttpPost("{workerProfileId}/upload")]
        public async Task<IActionResult> UploadWorkerPhotos(int workerProfileId, [FromForm] IFormCollection form)
        {
            var profile = await _context.WorkerProfiles.FindAsync(workerProfileId);
            if (profile == null)
                return NotFound("Worker profile not found.");

            var files = form.Files;
            var descriptionsJson = form["descriptions"];

            if (files == null || files.Count == 0)
                return BadRequest("No files uploaded.");

            List<string?> descriptions = new();
            if (!string.IsNullOrEmpty(descriptionsJson))
            {
                try
                {
                    descriptions = JsonSerializer.Deserialize<List<string?>>(descriptionsJson)!;
                }
                catch
                {
                    return BadRequest("Invalid descriptions format. Must be a JSON array of strings.");
                }
            }

            if (descriptions.Count != 0 && descriptions.Count != files.Count)
            {
                return BadRequest("Descriptions count must match the number of files.");
            }

            var uploadPath = Path.Combine(_env.WebRootPath, "uploads", "worker-photos");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var uploadedPhotos = new List<WorkerPhoto>();

            for (int i = 0; i < files.Count; i++)
            {
                var file = files[i];
                var description = descriptions.Count > 0 ? descriptions[i] : null;

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var workerPhoto = new WorkerPhoto
                {
                    WorkerProfileId = workerProfileId,
                    ImageUrl = $"/uploads/worker-photos/{fileName}",
                    Description = description
                };

                _context.WorkerPhotos.Add(workerPhoto);
                uploadedPhotos.Add(workerPhoto);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Worker photos uploaded successfully.",
                photos = uploadedPhotos
            });
        }
    }
}
