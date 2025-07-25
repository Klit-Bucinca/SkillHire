using Microsoft.AspNetCore.Authorization;
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
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> GetWorkerServices()
        {
            var services = await _context.WorkerServices
                .Include(ws => ws.Service)
                .ToListAsync();

            var dtoList = services.Select(ws => new WorkerServiceDto
            {
                WorkerProfileId = ws.WorkerProfileId,
                ServiceId = ws.ServiceId,
                ServiceName = ws.Service.Name
            }).ToList();

            return Ok(dtoList);
        }

        // GET id
        [HttpGet("{workerProfileId}/{serviceId}")]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> GetWorkerService(int workerProfileId, int serviceId)
        {
            var ws = await _context.WorkerServices
                .Include(w => w.Service)
                .FirstOrDefaultAsync(ws => ws.WorkerProfileId == workerProfileId && ws.ServiceId == serviceId);

            if (ws == null) return NotFound();

            var dto = new WorkerServiceDto
            {
                WorkerProfileId = ws.WorkerProfileId,
                ServiceId = ws.ServiceId,
                ServiceName = ws.Service.Name
            };

            return Ok(dto);
        }

        // POST
        [HttpPost]
        [Authorize(Roles = "Worker")]
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
        [Authorize(Roles = "Worker")]
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
        [Authorize(Roles = "Worker")]
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
