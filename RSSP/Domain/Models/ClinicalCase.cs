using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class ClinicalCase : BaseEntity
    {
        public int PatientId { get; set; }
        public Patient Patient { get; set; } = null!;

        public string ProcedureType { get; set; } = null!;
        public string? Description { get; set; }
        public string? ExternalReference { get; set; }

        public ICollection<Scenario> Scenarios { get; set; } = new List<Scenario>();
    }
}
