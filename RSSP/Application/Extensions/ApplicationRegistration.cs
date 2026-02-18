
using Application.Interface.Service;

using Application.Service.Attempts;
using Application.Service.Users;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Application.Extensions
{
    public static class ApplicationRegistration 
    {
      
        public static IServiceCollection AddApplicationLayer(this IServiceCollection services)
        {
            // Registra AutoMapper buscando los Profiles en este ensamblado
            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            // Registro de Servicios de Aplicación
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IAttemptService, AttemptService>();
           

            return services;
        }
    }
}
