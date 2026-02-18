using System;

namespace Api.Models.Attempts
{
    public class CreateAttemptRequest
    {
        public int UserId { get; set; }

        public int TestId { get; set; }

        public int Duration { get; set; }

        public int ErrorCount { get; set; }

        public decimal? TrajectoryScore { get; set; }

        public decimal? PrecisionScore { get; set; }

        public decimal? SmoothnessScore { get; set; }

        public string CompletionStatus { get; set; } = null!;

        public DateTime? Date { get; set; }
    }
}

