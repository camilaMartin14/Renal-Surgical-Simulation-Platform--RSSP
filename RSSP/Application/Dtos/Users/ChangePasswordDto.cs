using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dtos.Users
{
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Debe ingresar su clave actual")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Debe ingresar su nueva clave")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Debe confirmar su nueva clave")]
        [Compare("NewPassword", ErrorMessage = "La confirmación de la nueva clave no coincide")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }
}
