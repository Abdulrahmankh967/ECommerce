
using _1_Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _1_Repository.Config
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Id)
                .ValueGeneratedNever();

            builder.Property(p => p.Amount)
                .HasColumnType("decimal(18,2)");

            builder.Property(p => p.Method)
                .HasColumnType("NVARCHAR")
                .HasMaxLength(50);

            builder.HasOne(p => p.Order)
               .WithOne(o => o.Payment)
               .HasForeignKey<Payment>(p => p.OrderId);
        }
    }
}
