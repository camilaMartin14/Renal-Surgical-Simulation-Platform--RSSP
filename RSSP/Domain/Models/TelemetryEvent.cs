using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class TelemetryEvent : BaseEntity
    {
        public int AttemptId { get; set; }
        public Attempt Attempt { get; set; } = null!;

        public DateTime Timestamp { get; set; }
        public string EventType { get; set; } = null!;
        public string? Data { get; set; }
    }
}
