using System.Security.Cryptography;

namespace prosumerAppBack.Helper;

public class PasswordHasher:IPasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 10000;
    
    public (byte[] salt, byte[] hash) HashPassword(string password)
    {
        byte[] salt = new byte[SaltSize];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }
        
        byte[] hash = new byte[HashSize];
        using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256))
        {
            hash = pbkdf2.GetBytes(HashSize);
        }
        
        return (salt, hash);
    }
    
    public bool VerifyPassword(string password, byte[] salt, byte[] hash)
    {
        byte[] testHash = new byte[HashSize];
        using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256))
        {
            testHash = pbkdf2.GetBytes(HashSize);
        }
        if (testHash.Length != hash.Length)
        {
            return false;
        }
        for (int i = 0; i < hash.Length; i++)
        {
            if (testHash[i] != hash[i])
            {
                return false;
            }
        }
        return true;
    }
}