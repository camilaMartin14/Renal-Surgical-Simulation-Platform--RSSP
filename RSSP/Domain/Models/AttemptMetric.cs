using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class AttemptMetric : BaseEntity
    {
        public int AttemptId { get; set; }
        public Attempt Attempt { get; set; } = null!;

        public string Name { get; set; } = null!;
        public decimal Value { get; set; }
        public string? Unit { get; set; }
        public string? Category { get; set; }
    }
}
