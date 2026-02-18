using Application.Interface.Result;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Service.Result
{
    internal class Result<T> : IResult<T>
    {
        public bool IsSuccess { get; }

        // Implementación del IsFailure a partir de IsSuccess
        public bool IsFailure => !IsSuccess;

        public T Value { get; }
        public string Error { get; }

        // El constructor debe ser privado para forzar el uso de los métodos estáticos
        private Result(bool isSuccess, T value, string? error)
        {
            // Validación básica para asegurar que el objeto Result es consistente
            if (isSuccess && error != null)
                throw new InvalidOperationException("Un resultado exitoso no debe tener un mensaje de error.");
            if (!isSuccess && value != null && !value.Equals(default(T)))
                throw new InvalidOperationException("Un resultado fallido no debe contener un valor.");

            IsSuccess = isSuccess;
            Value = value;
            Error = error ?? string.Empty;
        }

        // Método estático para devolver éxito (SUCCESS)
        public static Result<T> Success(T value) => new Result<T>(true, value, null);

        // Método estático para devolver fallo (FAILURE)
        public static Result<T> Failure(string error) => new Result<T>(false, default!, error);

        // Método estático para un Result sin valor (útil para operaciones void como Remove)
        public static Result<T> Failure(string error, T defaultValue) => new Result<T>(false, defaultValue, error);
    }
    
}
