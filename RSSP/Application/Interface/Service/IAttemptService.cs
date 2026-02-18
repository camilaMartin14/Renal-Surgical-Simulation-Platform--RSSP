using Application.Dtos.Attempts;
using Application.Interface.Result;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Authentication;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Interface.Service
{
    public interface IAttemptService
    {
        Task<IResult<AttemptReadDto>> CreateAttemptAsync(AttemptCreateDto attemptDto, CancellationToken cancellationToken);
        Task<IResult<AttemptReadDto>> GetByIdAsync(int id,CancellationToken cancellationToken);
        Task<IResult<bool>> UpdateAttemptAsync(int id, AttemptUpdateDto updateDto, CancellationToken cancellationToken);

    }
}
