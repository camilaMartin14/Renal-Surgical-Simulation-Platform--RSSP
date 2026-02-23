using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class SimulationSession : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int ScenarioId { get; set; }
        public Scenario Scenario { get; set; } = null!;

        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public string? Notes { get; set; }

        public ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();
    }
}
