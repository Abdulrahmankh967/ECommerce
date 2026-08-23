using _1_Repository.Data;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Context
{
    public class AppDbContext : DbContext
    {   

        public DbSet<Customer> Customers { get; set; }

        public DbSet<Order> Orders { get; set; }

        public DbSet<OrderItem> OrderItems { get; set; }

        public DbSet<Product> Products { get; set; }

        public DbSet<Category> Categories { get; set; }

        public DbSet<Payment> Payments { get; set; }

        public DbSet<RefreshToken> RefreshToken { get; set; }

        public DbSet<EmailVerification> EmailVerification { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
                
            // modelBuilder.ApplyConfiguration(new CourseConfiguration()); // not best practice

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }

    }
}
    