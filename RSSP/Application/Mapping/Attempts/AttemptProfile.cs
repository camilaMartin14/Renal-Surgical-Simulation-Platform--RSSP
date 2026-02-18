using Application.Dtos.Attempts;
using AutoMapper;
using Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Application.Mapping.Attempts
{
    public class AttemptProfile : Profile
    {
        public AttemptProfile()
        {
            // De Entidad -> ReadDto (Salida)
            CreateMap<Attempt, AttemptReadDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FirstName)) // Ejemplo de aplanamiento
                .ForMember(dest => dest.TestName, opt => opt.MapFrom(src => src.Test.Name));

            // De CreateDto -> Entidad (Entrada)
            CreateMap<AttemptCreateDto, Attempt>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Date ?? DateTime.UtcNow)) // Seteamos la fecha al crear
                .ForMember(dest => dest.Feedbacks, opt => opt.Ignore()); // Ignoramos colecciones en la creación simple

            // De UpdateDto -> Entidad (Actualización)
            CreateMap<AttemptUpdateDto, Attempt>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            // La línea anterior es un "pro-tip": solo mapea campos que no sean nulos
        }
    }
}
