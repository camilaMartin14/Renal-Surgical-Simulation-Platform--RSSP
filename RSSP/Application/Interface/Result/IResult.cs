using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.Result
{
    public interface IResult<T>
    {
        // Indica si la operación fue exitosa.
        bool IsSuccess { get; }

        // Indica si la operación falló (inverso de IsSuccess).
        bool IsFailure { get; }

        // El valor devuelto en caso de éxito. 
        // Su uso debe ser verificado antes con IsSuccess.
        T Value { get; }

        // El mensaje de error o la colección de errores en caso de fallo.
        // Una implementación más robusta podría usar List<string>.
        string Error { get; }
    }
}
