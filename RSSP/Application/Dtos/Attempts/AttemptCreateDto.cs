using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dtos.Attempts
{
    /*Uso de record: En .NET 8, los records son perfectos para DTOs porque son inmutables por defecto,
   tienen una sintaxis limpia y son muy ligeros.*/
    public record AttemptCreateDto(
     [Required, StringLength(50)] string GameKey,
     [Required, StringLength(20)] string GameDifficulty,
     [Required] int UserId,
     [Required] int TestId,
     [Range(1, int.MaxValue)] int Duration,
     int ErrorCount,
     [Range(0, 100)] decimal? TrajectoryScore,
     [Range(0, 100)] decimal? PrecisionScore,
     [Range(0, 100)] decimal? SmoothnessScore,
     [Required, StringLength(20)] string CompletionStatus,
     DateTime? Date
    );
}
