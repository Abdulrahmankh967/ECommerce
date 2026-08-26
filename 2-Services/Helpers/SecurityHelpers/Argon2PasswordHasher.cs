using Konscious.Security.Cryptography;
using System.Security.Cryptography;
using System.Text;

public class Argon2PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);

        byte[] passwordBytes = Encoding.UTF8.GetBytes(password);

        using var argon2 = new Argon2id(passwordBytes);

        argon2.Salt = salt;
        argon2.MemorySize = 32635;
        argon2.Iterations = 4;
        argon2.DegreeOfParallelism = 2;

        byte[] hash = argon2.GetBytes(32);

        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public bool Verify(string password, string passwordHash)
    {
        var parts = passwordHash.Split('.');

        if (parts.Length != 2)
        {
            throw new InvalidOperationException("Stored password hash is in an invalid format.");
        }

        byte[] salt = Convert.FromBase64String(parts[0]);
        byte[] storedHash = Convert.FromBase64String(parts[1]);

        using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password));
        argon2.Salt = salt;
        argon2.MemorySize = 32635;
        argon2.Iterations = 4;
        argon2.DegreeOfParallelism = 2;
        byte[] computedHash = argon2.GetBytes(32);
        return CryptographicOperations.FixedTimeEquals(computedHash, storedHash);
    }
}