using Application.Interface.UnitOfWor;
using Infraestruture.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestruture.UnitOfWorks
{
    public class UnitOfWork(JustinaDbContext context) : IUnitOfWork
    {
        private readonly JustinaDbContext _context = context ?? throw new NullReferenceException(nameof(context));
      
        
        public void Dispose()
        {
            _context.Dispose();
            GC.SuppressFinalize(this);
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
