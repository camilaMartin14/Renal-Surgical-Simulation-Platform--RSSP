using Application.Dtos.Attempts;
using Application.Interface.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers.Attempts
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AttemptsController : ControllerBase
    {
        private readonly IAttemptService _attemptService;
        private readonly ILogger<AttemptsController> _logger;
        private readonly Infraestruture.Persistence.Context.JustinaDbContext _context;

        public AttemptsController(IAttemptService attemptService, ILogger<AttemptsController> logger, Infraestruture.Persistence.Context.JustinaDbContext context)
        {
            _attemptService = attemptService;
            _logger = logger;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AttemptCreateDto createDto,CancellationToken cancellationToken)
        {
            _logger.LogInformation("Recibida petición POST para crear un intento.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _attemptService.CreateAttemptAsync(createDto,cancellationToken);

            if (result.IsFailure)
            {
                _logger.LogWarning("No se pudo crear el intento: {Error}", result.Error);
                return BadRequest(result.Error);
            }

            // 201 Created y el objeto resultante
            return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id,CancellationToken cancellationToken)
        {
            var result = await _attemptService.GetByIdAsync(id,cancellationToken);

            if (result.IsFailure)
                return NotFound(result.Error);

            return Ok(result.Value);
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int? userId, [FromQuery] int? scenarioId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var q = _context.Attempts.AsQueryable();
            if (userId.HasValue) q = q.Where(a => a.UserId == userId.Value);
            if (from.HasValue) q = q.Where(a => a.Date >= from.Value);
            if (to.HasValue) q = q.Where(a => a.Date <= to.Value);
            if (scenarioId.HasValue)
            {
                q = q.Where(a => a.SimulationSession != null && a.SimulationSession.ScenarioId == scenarioId.Value);
            }

            var list = await q
                .Select(a => new
                {
                    a.Id,
                    a.UserId,
                    a.TestId,
                    a.SimulationSessionId,
                    a.GameKey,
                    a.GameDifficulty,
                    a.Duration,
                    a.Date,
                    a.ErrorCount,
                    a.TrajectoryScore,
                    a.PrecisionScore,
                    a.SmoothnessScore,
                    a.CompletionStatus
                })
                .ToListAsync();

            return Ok(list);
        }
    }
}
