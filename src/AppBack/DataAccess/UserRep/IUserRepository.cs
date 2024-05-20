using prosumerAppBack.Models;


public interface IUserRepository
{
    Task<User> GetUserByIdAsync(Guid id);
    Task<User> GetUserByEmailAndPasswordAsync(string email, string password);
    Task<User> CreateUser(UserRegisterDto userRegisterDto);
    Task<User> GetUserByEmailAsync(string email);    
    Task<Boolean> UpdatePassword(Guid id, string oldPassword, string newPassword);
    Task<int> UpdateUser(Guid id, UserUpdateDto userUpdateDto);
    Task<List<UserDto>> GetAllUsersAsync(int pageNumber, int pageSize);
    Task<Boolean> CreateUserRequestToDso(Guid userID);
    Task<int> GetNumberOfUsers();
    Task<List<UserDto>> GetAllUsersAsync();
    Task<Boolean> ApproveUserRequestToDso(Guid id);
    Task<Boolean> DeclineUserRequestToDso(Guid id);
    Task CreatePasswordResetToken(string email);
    Task<User> GetUserByPasswordResetTokenAsync(string passwordResetToken);
    Task ResetPasswordToken(string token);
    public bool SharesWhidDSO(Guid userID);    
    Task<User> DisconnectFromDso(Guid id);
    Task<Boolean> UpdateUserDataSharing(Guid id, Boolean sharesDataWithDso);    
    Task<Boolean> UserAllreadyAppliedToDso(Guid id);
    public Task<Boolean> ResetPassword(Guid id, string newPassword);
    Task<List<UsersRequestedToDso>> GetUsersAppliedToDso();
    Task<bool> UserStatusAppliedToDso(Guid userId);
    Task<Boolean> RemoveUserRequestToDso(Guid id);
    public Task<User> SaveProfilePictureAsync(Guid userId, string profilePicture);
}