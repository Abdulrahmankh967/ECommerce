
using _1_Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _1_Repository.Config
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.HasKey(o => o.Id);

            builder.Property(o => o.Id)
                .ValueGeneratedNever();

            builder.Property(o => o.TotalPrice)
                .HasColumnType("decimal(18,2)");

            builder.HasOne(c => c.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(c => c.CustomerId);
                
        }
    }
}
