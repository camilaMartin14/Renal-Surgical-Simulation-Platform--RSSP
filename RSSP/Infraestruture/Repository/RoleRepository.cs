using Application.Interface.Repository;
using Domain.Models;
using Infraestruture.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestruture.Repository
{
    public class RoleRepository : IRoleRepository
    {
        private readonly JustinaDbContext _context;
        public RoleRepository(JustinaDbContext context)
        {
            _context = context;
        }

        public async Task<Role?> GetByNameAsync(string name)
        { 
            return await _context.Roles.FirstOrDefaultAsync(r => r.Name == name);
        }
    }
}
