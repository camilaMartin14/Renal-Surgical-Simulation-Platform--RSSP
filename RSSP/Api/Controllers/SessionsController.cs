using Infraestruture.Persistence.Context;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionsController : ControllerBase
    {
        private readonly JustinaDbContext _context;
        public SessionsController(JustinaDbContext context)
        {
            _context = context;
        }

        public record CreateSessionRequest(int UserId, int ScenarioId, string? Notes);

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSessionRequest req)
        {
            var scenario = await _context.Scenarios.FindAsync(req.ScenarioId);
            if (scenario == null)
                return BadRequest(new { errorCode = "SCENARIO_NOT_FOUND", message = "Escenario no encontrado" });

            var session = new Domain.Models.SimulationSession
            {
                UserId = req.UserId,
                ScenarioId = req.ScenarioId,
                StartedAt = DateTime.UtcNow,
                Notes = req.Notes
            };

            _context.SimulationSessions.Add(session);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = session.Id }, new { session.Id, session.UserId, session.ScenarioId, session.StartedAt, session.EndedAt });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var session = await _context.SimulationSessions
                .AsNoTracking()
                .Where(s => s.Id == id)
                .Select(s => new { s.Id, s.UserId, s.ScenarioId, s.StartedAt, s.EndedAt, s.Notes })
                .FirstOrDefaultAsync();

            if (session == null)
                return NotFound(new { errorCode = "SESSION_NOT_FOUND", message = "Sesión no encontrada" });

            return Ok(session);
        }

        [HttpPost("{id}/close")]
        public async Task<IActionResult> Close(int id)
        {
            var session = await _context.SimulationSessions.FindAsync(id);
            if (session == null)
                return NotFound(new { errorCode = "SESSION_NOT_FOUND", message = "Sesión no encontrada" });

            if (session.EndedAt != null)
                return BadRequest(new { errorCode = "SESSION_ALREADY_CLOSED", message = "La sesión ya está cerrada" });

            session.EndedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new { session.Id, session.StartedAt, session.EndedAt });
        }
    }
}
