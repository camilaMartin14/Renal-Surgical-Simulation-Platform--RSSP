using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class TelemetrySample : BaseEntity
    {
        public int AttemptId { get; set; }
        public Attempt Attempt { get; set; } = null!;

        public DateTime Timestamp { get; set; }

        public decimal X { get; set; }
        public decimal Y { get; set; }
        public decimal? NormalX { get; set; }
        public decimal? NormalY { get; set; }
        public decimal Velocity { get; set; }
    }
}
