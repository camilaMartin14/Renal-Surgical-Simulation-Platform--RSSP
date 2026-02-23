using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class Scenario : BaseEntity
    {
        public string Key { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        public int TestId { get; set; }
        public Test Test { get; set; } = null!;

        public int? ClinicalCaseId { get; set; }
        public ClinicalCase? ClinicalCase { get; set; }

        public bool IsActive { get; set; }

        public ICollection<SimulationSession> SimulationSessions { get; set; } = new List<SimulationSession>();
    }
}
