using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHire.Data;
using SkillHire.Dtos;
using SkillHire.Models;
using System.Security.Claims;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SkillHire.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HireController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        public HireController(AppDbContext ctx) => _ctx = ctx;


        [HttpPost]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> CreateHire([FromBody] HireCreateDto dto)
        {
        
            var clientId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (!await _ctx.Users.AnyAsync(u => u.Id == clientId && u.Role == "Client"))
                return BadRequest("Client not found.");

 
            if (!await _ctx.Users.AnyAsync(u => u.Id == dto.WorkerId && u.Role == "Worker"))
                return BadRequest("Worker not found.");

            var hire = new Hire
            {
                ClientId = clientId,
                WorkerId = dto.WorkerId,
                Date = dto.Date,
                Notes = dto.Notes
            };

            _ctx.Hires.Add(hire);
            await _ctx.SaveChangesAsync();

            return CreatedAtAction(nameof(GetHireById), new { id = hire.Id }, ToDto(hire));
        }

        private static HireDto ToDto(Hire h) => new()
        {
            Id = h.Id,
            ClientId = h.ClientId,
            WorkerId = h.WorkerId,
            Date = h.Date,
            Notes = h.Notes,
            Status = h.Status
        };


        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<HireDto>>> GetAll()
        {
            var list = await _ctx.Hires
                .AsNoTracking()
                .Select(h => new HireDto  
                {
                    Id = h.Id,
                    ClientId = h.ClientId,
                    WorkerId = h.WorkerId,
                    Date = h.Date,
                    Notes = h.Notes,
                    Status = h.Status
                })
                .ToListAsync();

            return Ok(list);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetHireById(int id)
        {
            var hire = await _ctx.Hires.FindAsync(id);
            return hire == null ? NotFound() : Ok(ToDto(hire));
        }


        [HttpGet("worker/{workerId}")]
        [Authorize(Roles = "Worker,Admin")]
        public async Task<ActionResult<IEnumerable<HireDto>>> GetForWorker(int workerId)
        {
            var list = await _ctx.Hires
                .Where(h => h.WorkerId == workerId)
                .AsNoTracking()
                .Select(h => new HireDto
                {
                    Id = h.Id,
                    ClientId = h.ClientId,
                    WorkerId = h.WorkerId,
                    Date = h.Date,
                    Notes = h.Notes,
                    Status = h.Status
                })
                .ToListAsync();

            return Ok(list);
        }


        [HttpGet("client/{clientId}")]
        [Authorize(Roles = "Client,Admin")]
        public async Task<ActionResult<IEnumerable<HireDto>>> GetForClient(int clientId)
        {
            var list = await _ctx.Hires
                .Where(h => h.ClientId == clientId)
                .AsNoTracking()
                .Select(h => new HireDto
                {
                    Id = h.Id,
                    ClientId = h.ClientId,
                    WorkerId = h.WorkerId,
                    Date = h.Date,
                    Notes = h.Notes,
                    Status = h.Status
                })
                .ToListAsync();

            return Ok(list);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Worker,Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] HireStatusUpdateDto dto)
        {
            var hire = await _ctx.Hires.FindAsync(id);
            if (hire == null) return NotFound();

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            if (hire.WorkerId != userId && !User.IsInRole("Admin"))
                return Forbid();

            if (hire.Status != HireStatus.Pending)
                return BadRequest("Already processed.");

            if (dto.Status is not (HireStatus.Accepted or HireStatus.Rejected))
                return BadRequest("Status must be Accepted or Rejected.");

            hire.Status = dto.Status;
            await _ctx.SaveChangesAsync();

            return Ok(ToDto(hire));
        }

        [HttpGet("client/stats")]
        [Authorize(Roles = "Client,Admin")]
        public async Task<IActionResult> GetClientStats([FromQuery] int? clientId)
        {
            var authId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var targetClientId = (User.IsInRole("Admin") && clientId.HasValue) ? clientId.Value : authId;

            var isClient = await _ctx.Users
                .AsNoTracking()
                .AnyAsync(u => u.Id == targetClientId && u.Role == "Client");
            if (!isClient) return BadRequest("Client not found.");

            var stats = await _ctx.Hires
                .AsNoTracking()
                .Where(h => h.ClientId == targetClientId)
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    pending = g.Count(h => h.Status == HireStatus.Pending),
                    accepted = g.Count(h => h.Status == HireStatus.Accepted),
                    rejected = g.Count(h => h.Status == HireStatus.Rejected),
                    total = g.Count()
                })
                .FirstOrDefaultAsync();

            return Ok(stats ?? new { pending = 0, accepted = 0, rejected = 0, total = 0 });
        }

        [HttpGet("admin/stats")]
        [Authorize(Roles = "Admin,Worker")]
        public async Task<IActionResult> GetAdminStats()
        {
            var now = DateTime.UtcNow;
            var startCurrent = now.AddDays(-7);
            var startPrev = now.AddDays(-14);
            var endPrev = startCurrent;

            var pending = await _ctx.Hires.CountAsync(h => h.Status == HireStatus.Pending);
            var accepted = await _ctx.Hires.CountAsync(h => h.Status == HireStatus.Accepted);
            var rejected = await _ctx.Hires.CountAsync(h => h.Status == HireStatus.Rejected);
            var totalHires = pending + accepted + rejected;

            var totalCurrent7d = await _ctx.Hires.CountAsync(h => h.Date >= startCurrent);
            var totalPrev7d = await _ctx.Hires.CountAsync(h => h.Date >= startPrev && h.Date < endPrev);

            double Percent(int curr, int prev) =>
                prev == 0 ? (curr > 0 ? 100 : 0) : ((double)(curr - prev) / prev) * 100;

            var decided = accepted + rejected;
            var acceptanceRate = decided == 0 ? 0 : (accepted * 100.0) / decided;

            var usersTotal = await _ctx.Users.CountAsync();
            var activeWorkers30d = await _ctx.Hires
                .Where(h => h.Date >= now.AddDays(-30))
                .Select(h => h.WorkerId)
                .Distinct()
                .CountAsync();

            return Ok(new
            {
                usersTotal,
                totalHires,
                pending,
                accepted,
                rejected,
                acceptanceRate,
                totalDelta7d = Percent(totalCurrent7d, totalPrev7d),
                activeWorkers30d
            });
        }
    }
}
