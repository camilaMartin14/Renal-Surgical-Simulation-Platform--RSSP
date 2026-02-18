using Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.Repository
{
    public interface IAttemptRepository
    {
        Task<IEnumerable<Attempt>> GetAllAsync();
        Task<Attempt?> GetByIdAsync(int id);
        Task AddAsync(Attempt attempt);
        void Update(Attempt attempt); // Sincrónico: solo cambia el estado de la entidad
        void Delete(Attempt attempt); // Sincrónico: solo marca para borrar
    }
}
