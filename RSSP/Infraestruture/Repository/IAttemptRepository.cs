using Domain.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infraestruture.Repository
{
    public interface IAttemptRepository
    {
        Task<Attempt> AddAsync(Attempt attempt);

        Task<List<Attempt>> GetByTestAsync(int testId);
    }
}

