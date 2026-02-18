using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Domain.Models
{
    public class Difficulty
    {
        public int Id { get; set; }
        public string Description { get; set; } = null!;
        public ICollection<Test> Tests { get; set; } = new List<Test>();
    }
}
