namespace _1_Repository.Data
{
    public class Admin : User
    {
        public DateTime? AppointedAt { get; set; } = DateTime.UtcNow;
    }
}
