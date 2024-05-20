using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using prosumerAppBack.Helper;
using prosumerAppBack.Models;

namespace prosumerAppBack.DataAccess;

public class UserRepository : IUserRepository
{
    private readonly DataContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenMaker _tokenMaker;

    public UserRepository(DataContext dbContext,IPasswordHasher passwordHasher, ITokenMaker tokenMaker)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _tokenMaker = tokenMaker;

    }
    public async Task<User> GetUserByIdAsync(Guid id)
    {
        return await _dbContext.Users.FindAsync(id);
    }
       
    public async Task<User> GetUserByEmailAndPasswordAsync(string email, string password)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            return null;
        }
        if (!_passwordHasher.VerifyPassword(password, user.Salt, user.PasswordHash))
        {
            return null;
        }
        return user;
    }

    public async Task<User> GetUserByEmailAsync(string email)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            return null;
        }

        return user;
    }

    public async Task CreatePasswordResetToken(string email)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

        user.PasswordResetTokenExpires = DateTime.Now.AddDays(1);
        user.PasswordResetToken = CreateTokenForPassword();
        await _dbContext.SaveChangesAsync();
    }
    public async Task ResetPasswordToken(string token)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == token);

        user.PasswordResetTokenExpires = null;
        user.PasswordResetToken = null;
        await _dbContext.SaveChangesAsync();
    }
    public async Task<User> GetUserByPasswordResetTokenAsync(string passwordResetToken)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == passwordResetToken);

        if (user == null)
        {
            return null;
        }

        return user;
    }

    private string CreateTokenForPassword()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(64));
    }

    public async Task<User> CreateUser(UserRegisterDto userRegisterDto)
    {
        byte[] salt;
        byte[] hash;
        (salt,hash)= _passwordHasher.HashPassword(userRegisterDto.Password);
        var newUser = new User
        {
            FirstName = userRegisterDto.FirstName,
            LastName = userRegisterDto.LastName,
            PhoneNumber = userRegisterDto.PhoneNumber,
            Email = userRegisterDto.Email,
            Address = userRegisterDto.Address.Split(",")[0],
            City = userRegisterDto.Address.Split(",")[1],
            Country = userRegisterDto.Address.Split(",")[2],
            Salt = salt,
            PasswordHash = hash,
            Role = "UnapprovedUser",
            ID = Guid.NewGuid(),
            PasswordResetToken = null,
            PasswordResetTokenExpires = null
        };
        _dbContext.Users.Add(newUser);
        await _dbContext.SaveChangesAsync();
        return newUser;
    }

    public async Task<List<UserDto>> GetAllUsersAsync(int pageNumber, int pageSize)
    {
        var pagedData = await _dbContext.Users
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserDto {
                ID = u.ID,
                FirstName = u.FirstName,
                LastName = u.LastName,
                PhoneNumber = u.PhoneNumber,
                Address = u.Address,
                City = u.City,
                Country = u.Country,
                Role = u.Role,
                Email = u.Email
            })
            .ToListAsync();
        return pagedData;
    }

    public async Task<IEnumerable<User>> GetUsersAsync()
    {
        var users = (IEnumerable<User>)_dbContext.Users.ToListAsync();

        if (users == null)
        {
            return null;
        }

        return users;
    }

    public async Task<int> UpdateUser(Guid id, UserUpdateDto userUpdateDto)
    {
        User user = await this.GetUserByIdAsync(id);

        if(user == null)
        {
            return 0;
        }

        user.FirstName = userUpdateDto.FirstName;
        user.LastName = userUpdateDto.LastName;
        user.Address = userUpdateDto.Address;
        user.Country = userUpdateDto.Country;
        user.Email = userUpdateDto.Email;
        user.PhoneNumber = userUpdateDto.PhoneNumber;
        user.sharesDataWithDso = userUpdateDto.sharesDataWithDso;
        user.City = userUpdateDto.City;
        
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();

        return 2; // sve je proslo kako treba
    }

    public async Task<Boolean> UpdatePassword(Guid id, string oldPassword, string newPassword)
    {
        var user = await this.GetUserByIdAsync(id);

        if (user == null)
        {
            return false;
        }

        var isUserRight = _passwordHasher.VerifyPassword(oldPassword, user.Salt, user.PasswordHash);
        if (isUserRight == false)
            return false;

        string token = _tokenMaker.GenerateToken(user);

        bool result = _tokenMaker.ValidateJwtToken(token);

        if (result == false)
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

    public async Task<Boolean> ResetPassword(Guid id, string newPassword)
    {
        var user = await this.GetUserByIdAsync(id);

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
    public async Task<Boolean> CreateUserRequestToDso(Guid userID)
    {
        var user = _dbContext.UsersAppliedToDSO.FirstOrDefault(x => x.UserID == userID && x.Approved == null);
        if(user != null)
        {
            return false;
        }
        var newUser = new UsersRequestedToDso
        {
            ID = Guid.NewGuid(),
            UserID = userID,
            Approved = null,
            Date = null
        };
        _dbContext.UsersAppliedToDSO.Add(newUser);
        await _dbContext.SaveChangesAsync();
        return true;
    }
    public async Task<Boolean> ApproveUserRequestToDso(Guid id)
    {
        var newUser = await _dbContext.UsersAppliedToDSO.FirstOrDefaultAsync(x => x.UserID == id && x.Approved == null);
        if(newUser == null)
        {
            return false;
        }
        newUser.Approved = true;
        newUser.Date = DateTime.Now;

        var approvedUser = _dbContext.Users.FirstOrDefaultAsync(u => u.ID == newUser.UserID);
        approvedUser.Result.Role = "RegularUser";
        approvedUser.Result.sharesDataWithDso = true;
        _dbContext.Users.Update(approvedUser.Result);
        _dbContext.UsersAppliedToDSO.Update(newUser);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<Boolean> DeclineUserRequestToDso(Guid id)
    {
        var user = await _dbContext.UsersAppliedToDSO.FirstOrDefaultAsync(x => x.UserID == id && x.Approved == false);
        if (user == null)
        {
            return false;
        }
        user.Approved = false;
        user.Date = DateTime.Now;
        
        _dbContext.UsersAppliedToDSO.Update(user);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<User> DisconnectFromDso(Guid id)
    {
        var user = await _dbContext.Users.FindAsync(id);
        user.Role = "UnapprovedUser";
        user.sharesDataWithDso = false;
        var devices = _dbContext.Devices.Where(u => u.OwnerID == id).ToList();

        foreach (var device in devices)
        {
            device.dsoHasControl = false;
        }

        _dbContext.Users.Update(user);

        var forDelete = _dbContext.UsersAppliedToDSO.FirstOrDefaultAsync(u => u.UserID.ToString().ToUpper() == id.ToString().ToUpper());

        _dbContext.UsersAppliedToDSO.Remove(forDelete.Result);
        await _dbContext.SaveChangesAsync();
        
        return user;
    }

    public async Task<int> GetNumberOfUsers()
    {
        return await _dbContext.Users.CountAsync();
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        var users = await _dbContext.Users
            .Where(r => r.Role == "RegularUser")
            .Select(u => new UserDto {
                ID = u.ID,
                FirstName = u.FirstName,
                LastName = u.LastName,
                PhoneNumber = u.PhoneNumber,
                Address = u.Address,
                City = u.City,
                Country = u.Country,
                Role = u.Role,
                Email = u.Email
            })
            .ToListAsync();

        return users;
    }

    public bool SharesWhidDSO(Guid userID)
    {
        bool sharesWithDSO = _dbContext.Users
                            .Where(u => u.ID == userID)
                            .Select(share => share.sharesDataWithDso)
                            .FirstOrDefault();

        return sharesWithDSO;
                            
    }
       
    public async Task<Boolean> UpdateUserDataSharing(Guid id, Boolean sharesDataWithDso)
    {
        var user = await _dbContext.Users.FindAsync(id);
        if (user.Role != "RegularUser")
        {
            return false;
        }
        user.sharesDataWithDso = sharesDataWithDso;

        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();
        return true;
    }    

    public async Task<List<UsersRequestedToDso>> GetUsersAppliedToDso()
    {
        var users = await _dbContext.UsersAppliedToDSO
            .Where(u => u.Approved == null)
            .ToListAsync();

        if (users == null)
        {
            return null;
        }

        return users;
    }

    public async Task<bool> UserStatusAppliedToDso(Guid userId)
    {
        var status = await _dbContext.UsersAppliedToDSO.FirstOrDefaultAsync(u =>
            u.UserID.ToString().ToUpper() == userId.ToString().ToUpper());
        
        Console.WriteLine(status);
        
        if (status.Approved == null)
            return false;
        if (status.Approved == false)
            return false;
        
        return true;
    }


    public async Task<Boolean> UserAllreadyAppliedToDso(Guid id)
    {
        var user = await _dbContext.UsersAppliedToDSO.FirstOrDefaultAsync(u => u.UserID.ToString().ToUpper() == id.ToString().ToUpper());
        if (user == null)
        {
            return false;
        }
        
        return true;
    }

    public async Task<Boolean> RemoveUserRequestToDso(Guid id)
    {
        var user = await _dbContext.UsersAppliedToDSO.FirstOrDefaultAsync(x => x.UserID == id && x.Approved == null);

        _dbContext.UsersAppliedToDSO.Remove(user);
        await _dbContext.SaveChangesAsync();
        return true;
    }
    public async Task<User> SaveProfilePictureAsync(Guid userId, string profilePicture)
    {
        var user = await _dbContext.Users.FindAsync(userId);

        user.profilePicture = profilePicture;
        await _dbContext.SaveChangesAsync();

        return user;
    }
}
