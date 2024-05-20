namespace prosumerAppBack.Helper;

public interface IPasswordHasher
{
    (byte[] salt, byte[] hash) HashPassword(string password);
    bool VerifyPassword(string password, byte[] salt, byte[] hash);
}