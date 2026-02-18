namespace Api.Models.Attempts
{
    public class AttemptSummaryDto
    {
        public int Attempts { get; set; }

        public double AverageDuration { get; set; }

        public double AverageErrorCount { get; set; }

        public decimal? BestPrecisionScore { get; set; }

        public decimal? BestTrajectoryScore { get; set; }

        public decimal? BestSmoothnessScore { get; set; }
    }
}

