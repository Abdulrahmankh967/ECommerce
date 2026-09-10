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

            builder.Property(sa => sa.ShippingRecipientName)
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(sa => sa.ShippingPhone)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(sa => sa.ShippingCity)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(sa => sa.ShippingStreet)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(sa => sa.ShippingBuildingNumber)
                .HasMaxLength(50);

            builder.Property(sa => sa.ShippingPostalCode)
                .HasMaxLength(20);
        }
    }
}
