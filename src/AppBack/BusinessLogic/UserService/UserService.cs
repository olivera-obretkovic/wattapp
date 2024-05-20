using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using prosumerAppBack.DataAccess;
using prosumerAppBack.Models;
using SendGrid.Helpers.Errors.Model;

namespace prosumerAppBack.BusinessLogic;

public class UserService:IUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly DataContext _dbContext;
    private readonly HttpClient _httpClient;
    private readonly IUserRepository _repository;
    public UserService(IHttpContextAccessor httpContextAccessor, HttpClient httpClient, DataContext dbContext, IUserRepository repository)
    {
        _httpContextAccessor = httpContextAccessor;
        _httpClient = httpClient;
        _dbContext = dbContext;
        _repository = repository;
    }

    public Guid? GetID()
    {
        var token = _httpContextAccessor.HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var handler = new JwtSecurityTokenHandler();
        try
        {
            var jwtToken = handler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "unique_name");
            if (userIdClaim != null)
            {
                Guid userIdGuid;
                if (Guid.TryParse(userIdClaim.Value, out userIdGuid))
                {
                    return userIdGuid;
                }
            }

            return null;
        }
        catch (Exception ex)
        {
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
    public async Task<IEnumerable<object>> GetCoordinatesForAllUsers()
    {
        var bingMapsApiKey = "AjxCmzN-m_jJJS97ob2OeGpEhL4afHaUSYTKRhRa1BzCAzc9A6Wri3lB6QjzxYBp";

        var results = new List<object>();
        var addresses = await _dbContext.Users
            .Select(u => new 
            {
                u.Address,
                u.City,
                u.Country
            })
            .ToListAsync();

        foreach (var address in addresses)
        {
            var addressFull = $"{address.Address} {address.City} {address.Country}";
            Console.WriteLine(addressFull);
            var urlBuilder = new UriBuilder("http://dev.virtualearth.net/REST/v1/Locations");
            urlBuilder.Query = $"q={Uri.EscapeDataString(addressFull)}&key={bingMapsApiKey}";

            var url = urlBuilder.ToString();
            
            var response = await _httpClient.GetAsync(url);
            var responseString = await response.Content.ReadAsStringAsync();

            var data = JObject.Parse(responseString);
            var location = data["resourceSets"][0]["resources"][0]["point"]["coordinates"];

            results.Add(new
            {
                Address = address, 
                Coordinates = JsonConvert.SerializeObject(location)
            });
        }

        return results;
    }

    public async Task<User> GetUserByEmailAsync(string email)
    {
        var user = await _repository.GetUserByEmailAsync(email);
        if (user == null)
        {
            throw new NotFoundException("user with that email doesnt exist");
        }

        return user;
    }

    public async Task<User> GetUserByPasswordResetTokenAsync(string passwordResetToken)
    {
        var user = await _repository.GetUserByPasswordResetTokenAsync(passwordResetToken);
        if (user == null)
        {
            throw new NotFoundException("user with that passwordResetToken doesnt exist");
        }
        if (!(user.PasswordResetTokenExpires > DateTime.Now))
        {
            throw new NotFoundException("user with that passwordResetToken doesnt exist");
        }


        return user;
    }

    public async Task<User> CheckEmail(string email)
    {
        var user = await _repository.GetUserByEmailAsync(email);
        if (user != null)
        {
            throw new NotFoundException("email already exist");
        }

        return user;
    }

    public async Task<User> CreateUser(UserRegisterDto userRegisterDto)
    {
        var user = await _repository.CreateUser(userRegisterDto);
        if (user == null)
        {
            throw new NullReferenceException("Failed to create user");
        }

        return user;
    }
    public async Task<User> GetUserByEmailAndPasswordAsync(string email, string password)
    {
        var user = await _repository.GetUserByEmailAndPasswordAsync(email, password);
        if (user == null)
        {
            return null;
        }

        return user;
    }
    public async Task<User> GetUserByIdAsync(Guid id)
    {
        var user = await _repository.GetUserByIdAsync(id);
        if (user == null)
        {
            throw new NullReferenceException("User not found");
        }

        return user;
    }

    public async Task<List<UserDto>> GetAllUsersAsync(int pageNumber, int pageSize)
    {
        var user = await _repository.GetAllUsersAsync(pageNumber, pageSize);
        if (user == null)
        {
            throw new NullReferenceException("There are no users");
        }

        return user;
    }

    public async Task<int> UpdateUser(Guid id, UserUpdateDto userUpdateDto)
    {
        var user = await _repository.UpdateUser(id, userUpdateDto);
        if (user == 0)
        {
            throw new NotFoundException("user cannot be updated");
        }

        return user;
    }
    
    public async Task<Boolean> UpdatePassword(Guid id, string oldPassword, string newPassword)
    {
        var action = await _repository.UpdatePassword(id, oldPassword, newPassword);
        if (!action)
        {
            throw new NullReferenceException("Action failed");
        }
        return true;
    }

    public async Task<Boolean> ResetPassword(Guid id, string newPassword)
    {
        var action = await _repository.ResetPassword(id, newPassword);
        if (!action)
        {
            throw new NullReferenceException("Action failed");
        }
        return true;
    }

    public async Task<Boolean> CreateUserRequestToDso(Guid userID)
    {
        var action = await _repository.CreateUserRequestToDso(userID);
        if (!action)
        {
            throw new NullReferenceException("Action failed");
        }
        return true;
    }
    
    public async Task<object> GetCoordinatesForUser(Guid id)
    {
        var bingMapsApiKey = "AjxCmzN-m_jJJS97ob2OeGpEhL4afHaUSYTKRhRa1BzCAzc9A6Wri3lB6QjzxYBp";

        var adress = _dbContext.Users
            .Where(u => u.ID == id)
            .Select(u => new 
            {
                u.Address,
                u.City,
                u.Country
            })
            .FirstOrDefault();

        var addressFull = $"{adress.Address} {adress.City} {adress.Country}";
        var urlBuilder = new UriBuilder("http://dev.virtualearth.net/REST/v1/Locations");
        urlBuilder.Query = $"q={Uri.EscapeDataString(addressFull)}&key={bingMapsApiKey}";

        var url = urlBuilder.ToString();
        
        var response = await _httpClient.GetAsync(url);
        var responseString = await response.Content.ReadAsStringAsync();

        var data = JObject.Parse(responseString);
        var location = data["resourceSets"][0]["resources"][0]["point"]["coordinates"];

        return(new
        {
            Address = adress,
            Coordinates = JsonConvert.SerializeObject(location)
        });
        
    }

    public async Task<int> GetNumberOfUsers()
    {
        return await _repository.GetNumberOfUsers();
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        var action = await _repository.GetAllUsersAsync();
        if (action == null)
        {
            throw new NullReferenceException("Action failed");
        }

        return action;
    }
    public async Task<Boolean> ApproveUserRequestToDso(Guid id)
    {
        var action = await _repository.ApproveUserRequestToDso(id);
        if (!action)
        {
            throw new NullReferenceException("Action failed");
        }
        return true;
    }

    public async Task<Boolean> DeclineUserRequestToDso(Guid id)
    {
        var action = await _repository.DeclineUserRequestToDso(id);
        if (!action)
        {
            throw new NullReferenceException("Action failed");
        }
        return true;
    }
    public async Task<Boolean> RemoveUserRequestToDso(Guid id)
    {
        var action = await _repository.RemoveUserRequestToDso(id);
        if (!action)
        {
            throw new NullReferenceException("Action failed");
        }
        return true;
    }

    public async Task<User> DisconnectFromDso(Guid id)
    {
        var user = await _repository.DisconnectFromDso(id);
        if (user == null)
        {
            throw new NullReferenceException("Action failed");
        }
        return user;
    }
    public async Task<Boolean> UpdateUserDataSharing(Guid id, Boolean sharesDataWithDso)
    {
        var action = await _repository.UpdateUserDataSharing(id, sharesDataWithDso);
        if (!action)
        {
            throw new BadRequestException("User data sharing permission has failed to update");
        }
        return true;
    }    

    public async Task<List<UsersRequestedToDso>> GetUsersAppliedToDso()
    {
        var users = await _repository.GetUsersAppliedToDso();
        
        return users;
    }

    public async Task CreatePasswordResetToken(string email)
    {
        await _repository.CreatePasswordResetToken(email);        
    }

    public async Task ResetPasswordToken(string token)
    {
        await _repository.ResetPasswordToken(token);
    }

    public bool SharesWhidDSO(Guid userID)
    {
        return _repository.SharesWhidDSO(userID);
    }
    
    public async Task<Boolean> UserAllreadyAppliedToDso(Guid id)
    {
        return await _repository.UserAllreadyAppliedToDso(id);
    }

    public async Task<bool> UserStatusAppliedToDso(Guid userId)
    {
        return await _repository.UserStatusAppliedToDso(userId);
    }
    public async Task<bool> SaveImageForUser(Guid id, string profilePicture)
        
    {
        var user = await _repository.SaveProfilePictureAsync(id, profilePicture);

        if (user == null)
        {
            return false;
        }
        
        return true;
    }
}