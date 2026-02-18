using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dtos.Attempts
{
    /*Uso de record: En .NET 8, los records son perfectos para DTOs porque son inmutables por defecto,
   tienen una sintaxis limpia y son muy ligeros.*/
    public record AttemptUpdateDto(
    int Id,
    int Duration,
    int ErrorCount,
    decimal? TrajectoryScore,
    decimal? PrecisionScore,
    decimal? SmoothnessScore,
    string CompletionStatus
    );
}
