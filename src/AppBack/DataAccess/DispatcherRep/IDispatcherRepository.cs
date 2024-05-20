using Microsoft.AspNetCore.Components;
using prosumerAppBack.Models.Dispatcher;
using Dispatcher = prosumerAppBack.Models.Dispatcher.Dispatcher;

namespace prosumerAppBack.DataAccess.DispatcherRep;

public interface IDispatcherRepository
{
    Task<Dispatcher> GetDispatcherByIdAsync(Guid id);
    Task<Dispatcher> GetUserByEmailAndPasswordAsync(string email, string password);
    Task<Boolean> UpdatePassword(Guid id, string newPassword);
    Task<Dispatcher> CreateDispatcher(DispatcherRegisterDto dispatcherRegisterDto);
    Task<Dispatcher> GetDispatcherByEmailAsync(string email);
    Task<List<Dispatcher>> GetAllDispatchersAsync();
    Task<Boolean> DeleteDispatcher(Guid dispatcherID);
    Task<Boolean> UpdateDispatcher(Guid id, DispatcherUpdateDto dispatcherUpdateDto);
    Task<IEnumerable<object>> GetAllUsersAplicationToDsoAsync();
    Task<Boolean> UpdateDispatcherPassword(Guid id, DispatcherPasswordUpdate dispatcherPasswordUpdate);
}
