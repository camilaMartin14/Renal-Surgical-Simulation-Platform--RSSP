using Application.Dtos.Users;
using Application.Interface.Repository;
using Application.Interface.Service;
using AutoMapper;
using Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Application.Interface.UnitOfWor;

namespace Application.Service.Users
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IUserRoleRepository _userRoleRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        public AuthService(IUserRepository userRepository, IConfiguration configuration, IRoleRepository roleRepository, IUserRoleRepository userRoleRepository, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _userRoleRepository = userRoleRepository;
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<int> RegisterAsync(RegisterUserDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user != null)
            {
                throw new Exception("Ya existe un usuario con este email");
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var newUser = new User
            {
                Email = dto.Email,
                PasswordHash = passwordHash,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                IsActive = true,
                EmailConfirmed = true, //para que no moleste en desarrollo. En producción, esto debería ser false y requerir confirmación por email.
                CreatedBy = "System"
            };

            await _userRepository.AddAsync(newUser);

            var defaultRole = await _roleRepository.GetByNameAsync("Cirujano");
            if (defaultRole == null)
                throw new Exception("No se encontró el rol por defecto 'Cirujano'");

            var userRole = new UserRole
            {
                User = newUser,
                Role = defaultRole,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = "System"
            };

            await _userRoleRepository.AddUserRoleAsync(userRole);
            await _unitOfWork.SaveChangesAsync();
            return newUser.Id;
        }

        public async Task<string> LoginAsync(LoginUserDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);

            if (user == null)
                throw new Exception("Usuario no encontrado");

            bool passwordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

            if (!passwordValid)
                throw new Exception("Contraseña incorrecta");

            //Generar el token
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            };

            foreach (var userRole in user.UserRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, userRole.Role.Name));
            }

            //obtiene la clave secreta del appsettings.json
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("AppSettings:Token").Value));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1), // El token expirará en 1 día
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public async Task ChangePasswordAsync(ChangePasswordDto dto, string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                throw new Exception("Usuario no encontrado");

            bool currentPasswordValid = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash);
            if (!currentPasswordValid)
                throw new Exception("Contraseña actual incorrecta");

            if (dto.NewPassword != dto.ConfirmNewPassword)
                throw new Exception("La nueva contraseña y la confirmación no coinciden");
            if (dto.NewPassword.Length < 6)
                throw new Exception("La nueva contraseña debe tener al menos 6 caracteres");

            string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            user.PasswordHash = newPasswordHash;
            await _userRepository.UpdateAsync(user);
        }
    }
}