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
     string UserName,
     int TestId,
     string TestName,
     int Duration,
     DateTime Date,
     int ErrorCount,
     decimal? TrajectoryScore,
     decimal? PrecisionScore,
     decimal? SmoothnessScore,
     string CompletionStatus,
     IEnumerable<TelemetrySampleDto> TelemetrySamples
    );

    public record TelemetrySampleDto(decimal X, decimal Y, long Timestamp);

}
