using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHire.Data;
using SkillHire.Models;

namespace SkillHire.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkerPhotoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkerPhotoController(AppDbContext context)
        {
            _context = context;
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

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkerPhoto(int id)
        {
            var photo = await _context.WorkerPhotos.FindAsync(id);
            if (photo == null) return NotFound();

            _context.WorkerPhotos.Remove(photo);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
