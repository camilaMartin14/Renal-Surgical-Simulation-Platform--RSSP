using Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.Repository
{
    public interface IUserRoleRepository
    {
        Task AddUserRoleAsync(UserRole userRole);
    }
}
