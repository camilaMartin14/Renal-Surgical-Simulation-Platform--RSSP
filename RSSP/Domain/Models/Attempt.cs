using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class Attempt
    {
        public int Id { get; set; }
        public string GameKey { get; set; } = null!;
        public string GameDifficulty { get; set; } = null!;
        public int? SimulationSessionId { get; set; }
        public SimulationSession? SimulationSession { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int TestId { get; set; }
        public Test Test { get; set; } = null!;
        public int Duration { get; set; }
        public DateTime Date { get; set; }
        public int ErrorCount { get; set; }
        public decimal? TrajectoryScore { get; set; }
        public decimal? PrecisionScore { get; set; }
        public decimal? SmoothnessScore { get; set; }
        public string CompletionStatus { get; set; } = null!; // Podrías usar un Enum aquí
        public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
        public ICollection<TelemetrySample> TelemetrySamples { get; set; } = new List<TelemetrySample>();
        public ICollection<TelemetryEvent> TelemetryEvents { get; set; } = new List<TelemetryEvent>();
        public ICollection<AttemptMetric> Metrics { get; set; } = new List<AttemptMetric>();
    }
}
