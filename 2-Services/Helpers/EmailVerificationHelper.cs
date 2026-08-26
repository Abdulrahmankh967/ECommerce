using System.Security.Cryptography;
using System.Text;

public class EmailVerificationHelper
{
    public static string GenerateVerificationCode()
    {
        int code = RandomNumberGenerator.GetInt32(100000, 1000000);

        return code.ToString();
    }

    public static string GenerateVerificationId()
    {
        return Guid.NewGuid().ToString();
    }
    public static byte[] Hash(string code)
    {
        return SHA256.HashData(Encoding.UTF8.GetBytes(code));
    }
}