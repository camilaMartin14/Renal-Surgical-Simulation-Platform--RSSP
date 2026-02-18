using Application.Dtos.Attempts;
using Application.Interface.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Attempts
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttemptsController : ControllerBase
    {
        private readonly IAttemptService _attemptService;
        private readonly ILogger<AttemptsController> _logger;

        public AttemptsController(IAttemptService attemptService, ILogger<AttemptsController> logger)
        {
            _attemptService = attemptService;
            _logger = logger;
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
    }
}
