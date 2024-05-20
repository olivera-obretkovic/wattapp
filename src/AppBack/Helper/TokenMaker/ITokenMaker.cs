using prosumerAppBack.Models;
using prosumerAppBack.Models.Dispatcher;

namespace prosumerAppBack.Helper;
public interface ITokenMaker{
    string GenerateToken(User user);
    bool ValidateJwtToken(string token);
    string GenerateToken(Dispatcher dispatcher);
}