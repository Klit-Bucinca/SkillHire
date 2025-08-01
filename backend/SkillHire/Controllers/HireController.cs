using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHire.Data;
using SkillHire.Dtos;
using SkillHire.Models;
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
            if (!await _ctx.Users.AnyAsync(u => u.Id == dto.ClientId && u.Role == "Client"))
                return BadRequest("Client not found.");

            if (!await _ctx.Users.AnyAsync(u => u.Id == dto.WorkerId && u.Role == "Worker"))
                return BadRequest("Worker not found.");

            var hire = new Hire
            {
                ClientId = dto.ClientId,
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
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] HireStatusUpdateDto dto)
        {
            var hire = await _ctx.Hires.FindAsync(id);
            if (hire == null) return NotFound();

            var userId = int.Parse(User.FindFirst("id")!.Value); 
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
    }
}
