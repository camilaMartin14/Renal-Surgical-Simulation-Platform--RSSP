using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Models
{
    public class Feedback
    {
        public int Id { get; set; }
        public int AttemptId { get; set; }
        public Attempt Attempt { get; set; } = null!;
        public string Comment { get; set; } = null!;
        public int Rating { get; set; }
        public string CreatedBy { get; set; } = null!;
    }
}
