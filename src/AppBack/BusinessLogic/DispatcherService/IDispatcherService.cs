using Microsoft.AspNetCore.Components;
using prosumerAppBack.Models.Dispatcher;
using Dispatcher = prosumerAppBack.Models.Dispatcher.Dispatcher;

namespace prosumerAppBack.BusinessLogic.DispatcherService
{
    public interface IDispatcherService
    {
        Guid? GetID();
        string GetRole();
        Task<Dispatcher> GetUserByEmailAndPasswordAsync(string email, string password);
        Task<Dispatcher> CheckEmail(string email);
        Task<Dispatcher> CreateDispatcher(DispatcherRegisterDto dispatcherRegisterDto);
        Task<List<Dispatcher>> GetAllDispatchersAsync();
        Task<Boolean> DeleteDispatcher(Guid dispatcherID);
        Task<Dispatcher> GetDispatcher(Guid id);
        Task<Boolean> UpdateDispatcher(Guid id, DispatcherUpdateDto dispatcherUpdateDto);
        Task<IEnumerable<object>> GetAllUsersAplicationToDsoAsync();
        Task<Boolean> UpdateDispatcherPassword(Guid id, DispatcherPasswordUpdate dispatcherPasswordUpdate);
    }
}
