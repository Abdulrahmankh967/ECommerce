using _1_Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _1_Repository.Config
{
    public class ShippingAddressConfiguration : IEntityTypeConfiguration<ShippingAddress>
    {
        public void Configure(EntityTypeBuilder<ShippingAddress> builder)
        {
            builder.HasKey(sa => sa.Id);

            builder.Property(sa => sa.Id)
                .ValueGeneratedOnAdd();

            builder.Property(sa => sa.RecipientName)
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(sa => sa.Phone)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(sa => sa.City)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(sa => sa.Street)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(sa => sa.BuildingNumber)
                .HasMaxLength(50);

            builder.Property(sa => sa.PostalCode)
                .HasMaxLength(20);
        }
    }
}
