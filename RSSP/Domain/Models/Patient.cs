using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class Patient : BaseEntity
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? ExternalId { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Sex { get; set; }

        public ICollection<ClinicalCase> ClinicalCases { get; set; } = new List<ClinicalCase>();
    }
}
