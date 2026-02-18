using Application.Dtos.Attempts;
using Application.Interface.Repository;
using Application.Interface.Result;
using Application.Interface.Service;
using Application.Interface.UnitOfWor;
using Application.Service.Result;
using AutoMapper;
using Domain.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Service.Attempts 
{ 


    public class AttemptService(
        IAttemptRepository repository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<AttemptService> logger) : IAttemptService
    {
        private readonly IAttemptRepository _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork)); 
        private readonly IMapper _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        private readonly ILogger<AttemptService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        public async Task<IResult<AttemptReadDto>> CreateAttemptAsync(AttemptCreateDto attemptDto, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Iniciando creación de intento para el usuario {UserId}", attemptDto.UserId);

                // Mapeo de DTO a Entidad
                var attempt = _mapper.Map<Attempt>(attemptDto);

                await _repository.AddAsync(attempt);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                // Mapeo de Entidad a ReadDto para devolverlo
                var resultDto = _mapper.Map<AttemptReadDto>(attempt);

                return Result<AttemptReadDto>.Success(resultDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error crítico al crear un intento para el usuario {UserId}", attemptDto.UserId);
                return Result<AttemptReadDto>.Failure("Ocurrió un error interno al procesar el intento.");
            }
        }

        public async Task<IResult<AttemptReadDto>> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            try
            {
                var attempt = await _repository.GetByIdAsync(id);

                if (attempt == null)
                {
                    _logger.LogWarning("Intento con ID {Id} no encontrado", id);
                    return Result<AttemptReadDto>.Failure($"El intento con ID {id} no existe.");
                }

                var dto = _mapper.Map<AttemptReadDto>(attempt);
                return Result<AttemptReadDto>.Success(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el intento {Id}", id);
                return Result<AttemptReadDto>.Failure("Error al consultar la base de datos.");
            }
        }

        public async Task<IResult<bool>> UpdateAttemptAsync(int id, AttemptUpdateDto updateDto, CancellationToken cancellationToken)
        {
            try
            {
                var existingAttempt = await _repository.GetByIdAsync(id);
                if (existingAttempt == null) return Result<bool>.Failure("No se encontró el registro para actualizar.");

                // Aplicamos los cambios del DTO a la entidad existente
                _mapper.Map(updateDto, existingAttempt);

                _repository.Update(existingAttempt);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el intento {Id}", id);
                return Result<bool>.Failure("No se pudo actualizar el registro.");
            }
        }
    }
}
