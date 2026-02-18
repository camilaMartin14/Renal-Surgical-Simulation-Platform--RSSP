using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class Test
    {
        public int Id { get; set; }
        public int DifficultyId { get; set; }
        public Difficulty Difficulty { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int ExpectedDuration { get; set; }
        public string ProcedureType { get; set; } = null!;
        public string Objective { get; set; } = null!;
        public string SimulatedRegion { get; set; } = null!;
        public ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();
    }
}
