using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dtos.Attempts
{
    /*Uso de record: En .NET 8, los records son perfectos para DTOs porque son inmutables por defecto,
    tienen una sintaxis limpia y son muy ligeros.*/
    public record AttemptReadDto(
     int Id,
     string GameKey,
     string GameDifficulty,
     int UserId,
     string UserName, // Un toque de "Flattening" para facilitar el consumo en el Front. Aplanamiento (Flattening): En el ReadDto incluimos UserName en lugar de todo el objeto User. Esto ahorra ancho de banda y simplifica el JSON.
     int TestId,
     string TestName,
     int Duration,
     DateTime Date,
     int ErrorCount,
     decimal? TrajectoryScore,
     decimal? PrecisionScore,
     decimal? SmoothnessScore,
     string CompletionStatus
    );
}
