using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHire.Data;
using SkillHire.Models;

namespace SkillHire.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkerServiceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkerServiceController(AppDbContext context)
        {
            _context = context;
        }

        // GET
        [HttpGet]
        public async Task<IActionResult> GetWorkerServices()
        {
            var workerServices = await _context.WorkerServices
                .Include(ws => ws.WorkerProfile)
                .Include(ws => ws.Service)
                .ToListAsync();

            return Ok(workerServices);
        }

        // GET id
        [HttpGet("{workerProfileId}/{serviceId}")]
        public async Task<IActionResult> GetWorkerService(int workerProfileId, int serviceId)
        {
            var workerService = await _context.WorkerServices
                .Include(ws => ws.WorkerProfile)
                .Include(ws => ws.Service)
                .FirstOrDefaultAsync(ws => ws.WorkerProfileId == workerProfileId && ws.ServiceId == serviceId);

            if (workerService == null) return NotFound();
            return Ok(workerService);
        }

        // POST
        [HttpPost]
        public async Task<IActionResult> CreateWorkerService([FromBody] WorkerService workerService)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.WorkerServices.Add(workerService);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWorkerService),
                new { workerProfileId = workerService.WorkerProfileId, serviceId = workerService.ServiceId },
                workerService);
        }

        // PUT
        [HttpPut("{workerProfileId}/{serviceId}")]
        public async Task<IActionResult> UpdateWorkerService(int workerProfileId, int serviceId, [FromBody] WorkerService workerService)
        {
            if (workerProfileId != workerService.WorkerProfileId || serviceId != workerService.ServiceId)
                return BadRequest();

            _context.Entry(workerService).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.WorkerServices.Any(ws =>
                    ws.WorkerProfileId == workerProfileId && ws.ServiceId == serviceId))
                    return NotFound();

                throw;
            }

            return NoContent();
        }

        // DELETE
        [HttpDelete("{workerProfileId}/{serviceId}")]
        public async Task<IActionResult> DeleteWorkerService(int workerProfileId, int serviceId)
        {
            var workerService = await _context.WorkerServices
                .FirstOrDefaultAsync(ws => ws.WorkerProfileId == workerProfileId && ws.ServiceId == serviceId);

            if (workerService == null) return NotFound();

            _context.WorkerServices.Remove(workerService);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
