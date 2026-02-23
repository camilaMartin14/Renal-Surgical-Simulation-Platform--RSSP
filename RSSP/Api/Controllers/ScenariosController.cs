using Infraestruture.Persistence.Context;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScenariosController : ControllerBase
    {
        private readonly JustinaDbContext _context;
        public ScenariosController(JustinaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var list = await _context.Scenarios
                .AsNoTracking()
                .Select(s => new { s.Id, s.Key, s.Name, s.TestId, s.IsActive })
                .ToListAsync();
            return Ok(list);
        }
    }
}
