using Application.Interface.Repository;
using Domain.Models;
using Infraestruture.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestruture.Repository
{
    public class UserRoleRepository : IUserRoleRepository
    {
        private readonly JustinaDbContext _context;
        public UserRoleRepository(JustinaDbContext context)
        {
            _context = context;
        }
        public async Task AddUserRoleAsync(UserRole userRole)
        {
            await _context.UserRoles.AddAsync(userRole);
        }
    }
}
