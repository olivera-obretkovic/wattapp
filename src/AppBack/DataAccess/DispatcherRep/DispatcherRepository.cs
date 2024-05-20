using prosumerAppBack.Helper;
using Microsoft.EntityFrameworkCore;
using prosumerAppBack.Models.Dispatcher;
using prosumerAppBack.Models;
using Microsoft.AspNetCore.Components;
using Dispatcher = prosumerAppBack.Models.Dispatcher.Dispatcher;

namespace prosumerAppBack.DataAccess.DispatcherRep;

public class DispatcherRepository : IDispatcherRepository
{
    private readonly DataContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenMaker _tokenMaker;

    public DispatcherRepository(DataContext dbContext, IPasswordHasher passwordHasher, ITokenMaker tokenMaker)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _tokenMaker = tokenMaker;
    }

    public async Task<Dispatcher> GetDispatcherByIdAsync(Guid id)
    {
        return await _dbContext.Dispatchers.FindAsync(id);
    }

    public async Task<Dispatcher> GetUserByEmailAndPasswordAsync(string email, string password)
    {
        var dispatcher = await _dbContext.Dispatchers.FirstOrDefaultAsync(u => u.Email == email);

        if (dispatcher == null)
        {
            return null;
        }
        if (!_passwordHasher.VerifyPassword(password, dispatcher.Salt, dispatcher.PasswordHash))
        {
            return null;
        }
        return dispatcher;
    }

    public async Task<Boolean> UpdatePassword(Guid id, string newPassword)
    {
        var user = await this.GetDispatcherByIdAsync(id);

        string token = _tokenMaker.GenerateToken(user);

        bool result = _tokenMaker.ValidateJwtToken(token);

        if (result == false)
        {
            return false;
        }

        if (user == null)
        {
            return false;
        }

        byte[] salt;
        byte[] hash;
        (salt, hash) = _passwordHasher.HashPassword(newPassword);

        user.Salt = salt;
        user.PasswordHash = hash;

        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<Dispatcher> CreateDispatcher(DispatcherRegisterDto dispatcherRegisterDto)
    {
        byte[] salt;
        byte[] hash;
        (salt, hash) = _passwordHasher.HashPassword(dispatcherRegisterDto.Password);
        var newDispatcher = new Dispatcher
        {
            FirstName = dispatcherRegisterDto.FirstName,
            LastName = dispatcherRegisterDto.LastName,
            PhoneNumber = dispatcherRegisterDto.PhoneNumber,
            Email = dispatcherRegisterDto.Email,
            Salt = salt,
            PasswordHash = hash,
            Role = "Dispatcher",
            ID = Guid.NewGuid(),
        };
        _dbContext.Dispatchers.Add(newDispatcher);
        await _dbContext.SaveChangesAsync();
        return newDispatcher;
    }

    public async Task<Dispatcher> GetDispatcherByEmailAsync(string email)
    {
        var dispatcher = await _dbContext.Dispatchers.FirstOrDefaultAsync(u => u.Email == email);

        if (dispatcher == null)
        {
            return null;
        }

        return dispatcher;
    }

    public async Task<List<Dispatcher>> GetAllDispatchersAsync()
    {
        var dispatchers = await _dbContext.Dispatchers
            .Where(u => u.Role == "Dispatcher")
            .Select(u => new Dispatcher
            {
                ID = u.ID,
                FirstName = u.FirstName,
                LastName = u.LastName,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role,
                Email = u.Email
            })
            .ToListAsync();

        return dispatchers;
    }

    public async Task<Boolean> DeleteDispatcher(Guid dispatcherID)
    {
        var dispatcher = _dbContext.Dispatchers.FirstOrDefaultAsync(d => d.ID == dispatcherID);

        if (dispatcher.Result != null)
        {
            _dbContext.Dispatchers.Remove(dispatcher.Result);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        return false;
    }

    public async Task<Boolean> UpdateDispatcher(Guid id, DispatcherUpdateDto dispatcherUpdateDto)
    {
        Dispatcher dispatcher = await this.GetDispatcherByIdAsync(id);

        if (dispatcher == null || dispatcher.Role != "Dispatcher")
        {
            return false;
        }

        dispatcher.FirstName = dispatcherUpdateDto.FirstName;
        dispatcher.LastName = dispatcherUpdateDto.LastName;
        dispatcher.Email = dispatcherUpdateDto.Email;
        dispatcher.PhoneNumber = dispatcherUpdateDto.PhoneNumber;
        
        _dbContext.Dispatchers.Update(dispatcher);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<Boolean> UpdateDispatcherPassword(Guid id, DispatcherPasswordUpdate dispatcherPasswordUpdate)
    {
        Dispatcher dispatcher = await this.GetDispatcherByIdAsync(id);

        if (dispatcher == null || dispatcher.Role != "Dispatcher")
        {
            return false;
        }

        var isDispatcherRight = _passwordHasher.VerifyPassword(dispatcherPasswordUpdate.OldPassword, dispatcher.Salt, dispatcher.PasswordHash);
        if (isDispatcherRight == false)
            return false;

        byte[] salt;
        byte[] hash;
        (salt, hash) = _passwordHasher.HashPassword(dispatcherPasswordUpdate.NewPassword);

        dispatcher.Salt = salt;
        dispatcher.PasswordHash = hash;

        _dbContext.Dispatchers.Update(dispatcher);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<object>> GetAllUsersAplicationToDsoAsync()
    {
        var users = await _dbContext.Users
            .Join(_dbContext.UsersAppliedToDSO, u => u.ID, o => o.UserID, (u, o) => new { User = u, UserApplied = o })
            .Where(d => d.UserApplied.Approved != null)
            .Select(d => new UserApplicationInfo() 
            {
                ID = d.User.ID,
                FirstName = d.User.FirstName,
                LastName = d.User.LastName,
                PhoneNumber = d.User.PhoneNumber,
                Address = d.User.Address,
                City = d.User.City,
                Country = d.User.Country,
                Email = d.User.Email,
                Approved = d.UserApplied.Approved,
                Date = d.UserApplied.Date
            })
            .ToListAsync();

        return users;
    }

    
}
