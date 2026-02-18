using Domain.Models;
using Infraestruture.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestruture.Persistence.Seeds
{
    public class DbSeeder
    {
        private readonly JustinaDbContext _context;
        public DbSeeder(JustinaDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            try
            {
                //verifica si existen los roles, sino los crea
                var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
                if (adminRole == null)
                {
                    adminRole = new Role { Name = "Admin", IsActive = true };
                    _context.Roles.Add(adminRole);
                    await _context.SaveChangesAsync();
                }

                var cirujanoRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Cirujano");
                if (cirujanoRole == null)
                {
                    cirujanoRole = new Role
                    {
                        Name = "Cirujano",
                        IsActive = true
                    };
                    _context.Roles.Add(cirujanoRole);
                    await _context.SaveChangesAsync();
                }

                //verifica si existen los usuarios, sino los crea
                var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "admin@justina.com");
                if (adminUser == null)
                {
                    adminUser = new User
                    {
                        Email = "admin@justina.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                        FirstName = "Admin",
                        LastName = "User",
                        IsActive = true,
                        EmailConfirmed = true,
                        CreatedBy = "System"
                    };
                    _context.Users.Add(adminUser);
                    await _context.SaveChangesAsync();
                }

                var testUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "testuser@justina.com");
                if (testUser == null)
                {
                    testUser = new User
                    {
                        Email = "testuser@justina.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                        FirstName = "Test",
                        LastName = "User",
                        IsActive = true,
                        EmailConfirmed = true,
                        CreatedBy = "System"
                    };
                    _context.Users.Add(testUser);
                    await _context.SaveChangesAsync();
                }

                // Asigna roles a los usuarios
                var hasAdminRole = await _context.UserRoles.AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == adminRole.Id);
                if (!hasAdminRole)
                {
                    _context.UserRoles.Add(new UserRole
                    {
                        UserId = adminUser.Id,
                        RoleId = adminRole.Id,
                        AssignedAt = DateTime.UtcNow,
                        AssignedBy = "System"
                    });
                }

                var hasCirujanoRole = await _context.UserRoles.AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == cirujanoRole.Id);
                if (!hasCirujanoRole)
                {
                    _context.UserRoles.Add(new UserRole
                    {
                        UserId = adminUser.Id,
                        RoleId = cirujanoRole.Id,
                        AssignedAt = DateTime.UtcNow,
                        AssignedBy = "System"
                    });
                }
                await _context.SaveChangesAsync();

                var testUserRole = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.UserId == testUser.Id && ur.RoleId == cirujanoRole.Id);
                if (testUserRole == null)
                {
                    testUserRole = new UserRole
                    {
                        UserId = testUser.Id,
                        RoleId = cirujanoRole.Id,
                        AssignedAt = DateTime.UtcNow,
                        AssignedBy = "System"
                    };
                    _context.UserRoles.Add(testUserRole);
                    await _context.SaveChangesAsync();
                }
            }

            catch (Exception ex)
            {
                throw new Exception("Error seeding database: " + ex.Message);
            }
        }
    }
}
