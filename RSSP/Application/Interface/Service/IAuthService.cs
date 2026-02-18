using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Dtos.Users;

namespace Application.Interface.Service
{
    public interface IAuthService
    {
        Task<int> RegisterAsync(RegisterUserDto dto);
        Task<string> LoginAsync(LoginUserDto dto);
        Task ChangePasswordAsync(ChangePasswordDto dto, string email);
    }
}
