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
        public WorkerServiceController(AppDbContext ctx) => _context = ctx;

        [HttpGet]
        [Authorize(Roles = "Worker,Admin")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.WorkerServices.ToListAsync();
            return Ok(list.Select(ws => new WorkerServiceDto
            {
                WorkerProfileId = ws.WorkerProfileId,
                ServiceId = ws.ServiceId
            }));
        }

        [HttpGet("{profileId:int}/{serviceId:int}")]
        [Authorize(Roles = "Worker,Admin")]
        public async Task<IActionResult> Get(int profileId, int serviceId)
        {
            var exists = await _context.WorkerServices
                .AnyAsync(ws => ws.WorkerProfileId == profileId && ws.ServiceId == serviceId);

            return exists
                ? Ok(new WorkerServiceDto { WorkerProfileId = profileId, ServiceId = serviceId })
                : NotFound();
        }

        [HttpPost]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> Add([FromBody] WorkerServiceDto dto)
        {
            if (!ModelState.IsValid)                      
                return BadRequest(ModelState);

            bool exists = await _context.WorkerServices.AnyAsync(ws =>
                ws.WorkerProfileId == dto.WorkerProfileId &&
                ws.ServiceId == dto.ServiceId);

            if (exists)
                return BadRequest("Service already added to this worker.");

            _context.WorkerServices.Add(new WorkerService
            {
                WorkerProfileId = dto.WorkerProfileId,
                ServiceId = dto.ServiceId
            });
            await _context.SaveChangesAsync();

            return Ok(new { message = "Service added." });
        }

        [HttpDelete("{profileId:int}/{serviceId:int}")]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> Delete(int profileId, int serviceId)
        {
            var ws = await _context.WorkerServices
                .FirstOrDefaultAsync(x => x.WorkerProfileId == profileId && x.ServiceId == serviceId);

            if (ws == null) return NotFound();

            _context.WorkerServices.Remove(ws);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Service removed." });
        }
    }
}
