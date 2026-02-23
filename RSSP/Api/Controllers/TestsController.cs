using Infraestruture.Persistence.Context;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestsController : ControllerBase
    {
        private readonly JustinaDbContext _context;

        public TestsController(JustinaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var tests = await _context.Tests
                .AsNoTracking()
                .Select(t => new { t.Id, t.Name })
                .ToListAsync();

            return Ok(tests);
        }
    }
}
