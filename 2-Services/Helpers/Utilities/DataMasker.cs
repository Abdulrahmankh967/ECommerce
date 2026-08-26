public static class DataMasker
{
    public static string MaskEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return "***";

        var parts = email.Split('@');

        if (parts.Length != 2)
            return "***";

        var name = parts[0];

        if (name.Length <= 2)
            return $"***@{parts[1]}";

        return $"{name[0]}***{name[^1]}@{parts[1]}";
    }
}