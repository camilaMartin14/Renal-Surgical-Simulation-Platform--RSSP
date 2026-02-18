using System;

namespace Api.Models.Attempts
{
    public class AttemptDto
    {
        public int Id { get; set; }
        public string GameKey { get; set; } = null!;
        public string GameDifficulty { get; set; } = null!;
        public int UserId { get; set; }
        public int TestId { get; set; }
        public int Duration { get; set; }
        public DateTime Date { get; set; }
        public int ErrorCount { get; set; }
        public decimal? TrajectoryScore { get; set; }
        public decimal? PrecisionScore { get; set; }
        public decimal? SmoothnessScore { get; set; }
        public string CompletionStatus { get; set; } = null!;
    }
}
