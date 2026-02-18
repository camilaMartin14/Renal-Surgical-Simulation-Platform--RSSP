using Application.Dtos.Users;
using Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.Repository
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email); //devuelve usuario o nulo.
        Task AddAsync(User user);
        Task UpdateAsync(User user);
    }
}
