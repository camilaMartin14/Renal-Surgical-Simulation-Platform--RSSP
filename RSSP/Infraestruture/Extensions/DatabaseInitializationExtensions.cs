using Infraestruture.Persistence.Seeds;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestruture.Extensions
{
    public static class DatabaseInitializationExtensions
    {
        public static async Task UseDbSeeder(this WebApplication app)
        { 
            using var scope = app.Services.CreateScope();
            var services = scope.ServiceProvider;
            try
            {
                var seeder = services.GetRequiredService<DbSeeder>();
                await seeder.SeedAsync();
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<DbSeeder>>();
                logger.LogError(ex, "Error al inicializar la base de datos");
            }
        }
    }
}
