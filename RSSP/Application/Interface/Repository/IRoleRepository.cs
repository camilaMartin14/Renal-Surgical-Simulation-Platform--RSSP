using Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.Repository
{
   public interface IRoleRepository
    {
        Task<Role?> GetByNameAsync(string name);
    }
}
