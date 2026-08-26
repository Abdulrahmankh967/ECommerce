using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _1_Repository.Config
{
    public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
    {
        public void Configure(EntityTypeBuilder<Supplier> builder)
        {
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Id)
                .ValueGeneratedOnAdd();

            builder.Property(s => s.Name)
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(s => s.Email)
                .HasMaxLength(150);

            builder.Property(s => s.Phone)
                .HasMaxLength(50);

            builder.Property(s => s.Address)
                .HasMaxLength(250);

            builder.Property(s => s.IsActive)
                .HasDefaultValue(true);

            builder.Property(s => s.CreatedAt)
                .IsRequired();
        }
    }
}
