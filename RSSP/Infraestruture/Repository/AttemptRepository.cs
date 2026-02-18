﻿using Domain.Models;
using Infraestruture.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infraestruture.Repository
{
    public class AttemptRepository : Application.Interface.Repository.IAttemptRepository
    {
        private readonly JustinaDbContext _context;

        public AttemptRepository(JustinaDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Attempt>> GetAllAsync()
        {
            return await _context.Attempts.AsNoTracking().ToListAsync();
        }

        public async Task<Attempt?> GetByIdAsync(int id)
        {
            return await _context.Attempts.FindAsync(id);
        }

        public async Task AddAsync(Attempt attempt)
        {
            await _context.Attempts.AddAsync(attempt);
        }

        public void Update(Attempt attempt)
        {
            _context.Attempts.Update(attempt);
        }

        public void Delete(Attempt attempt)
        {
            _context.Attempts.Remove(attempt);
        }
    }
}
