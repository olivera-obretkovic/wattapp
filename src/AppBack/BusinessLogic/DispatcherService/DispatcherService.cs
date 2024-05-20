using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Http.HttpResults;
using prosumerAppBack.DataAccess.DispatcherRep;
using prosumerAppBack.Models.Dispatcher;
using SendGrid.Helpers.Errors.Model;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Dispatcher = prosumerAppBack.Models.Dispatcher.Dispatcher;

namespace prosumerAppBack.BusinessLogic.DispatcherService
{
    public class DispatcherService : IDispatcherService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IDispatcherRepository _repository;

        public DispatcherService(IHttpContextAccessor httpContextAccessor, IDispatcherRepository repository)
        {
            _httpContextAccessor = httpContextAccessor;
            _repository = repository;
        }

        public Guid? GetID()
        {
            var token = _httpContextAccessor.HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            try
            {
                var jwtToken = handler.ReadJwtToken(token);
                var dispatcherIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "unique_name");
                if (dispatcherIdClaim != null)
                {
                    Guid dispatcherIdGuid;
                    if (Guid.TryParse(dispatcherIdClaim.Value, out dispatcherIdGuid))
                    {
                        return dispatcherIdGuid;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                // Log the exception
                return null;
            }
        }
        public string GetRole()
        {
            var role = string.Empty;

            if (_httpContextAccessor.HttpContext != null)
                role = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Role);

            return role;
        }

        public async Task<Dispatcher> GetUserByEmailAndPasswordAsync(string email, string password)
        {
            var dispatcher = await _repository.GetUserByEmailAndPasswordAsync(email, password);
            if (dispatcher == null)
            {
                throw new NullReferenceException("Invalid email or password");
            }

            return dispatcher;
        }

        public async Task<Dispatcher> CreateDispatcher(DispatcherRegisterDto dispatcherRegisterDto)
        {
            var dispatcher = await _repository.CreateDispatcher(dispatcherRegisterDto);
            if (dispatcher == null)
            {
                throw new NullReferenceException("Failed to create user");
            }

            return dispatcher;
        }
        public async Task<Dispatcher> CheckEmail(string email)
        {
            var dispatcher = await _repository.GetDispatcherByEmailAsync(email);
            if (dispatcher != null)
            {
                throw new NotFoundException("email already exist");
            }

            return dispatcher;
        }

        public async Task<List<Dispatcher>> GetAllDispatchersAsync()
        {
            var dispatchers = await _repository.GetAllDispatchersAsync();
            if (dispatchers == null)
            {
                throw new NotFoundException("no dispatchers found");
            }

            return dispatchers;
        }

        public async Task<Boolean> DeleteDispatcher(Guid dispatcherID)
        {
            var action = await _repository.DeleteDispatcher(dispatcherID);
            if (!action)
            {
                throw new BadRequestException("no dispatchers found");
            }

            return action;
        }

        public async Task<Dispatcher> GetDispatcher(Guid id)
        {
            var action = await _repository.GetDispatcherByIdAsync(id);
            if (action == null)
            {
                throw new BadRequestException("no dispatchers found");
            }

            return action;
        }

        public async Task<Boolean> UpdateDispatcher(Guid id, DispatcherUpdateDto dispatcherUpdateDto)
        {
            var action = await _repository.UpdateDispatcher(id, dispatcherUpdateDto);
            if (!action)
            {
                throw new BadRequestException("no dispatchers with that ID found");
            }

            return action;
        }

        public async Task<IEnumerable<object>> GetAllUsersAplicationToDsoAsync()
        {
            var users = await _repository.GetAllUsersAplicationToDsoAsync();
            if (users == null)
            {
                throw new BadRequestException("no users whos application was reviewed found");
            }

            return users;
        }

        public async Task<Boolean> UpdateDispatcherPassword(Guid id, DispatcherPasswordUpdate dispatcherPasswordUpdate)
        {
            var action = await _repository.UpdateDispatcherPassword(id, dispatcherPasswordUpdate);
            if (!action)
            {
                throw new NullReferenceException("Action failed");
            }
            return true;
        }
    }
}
