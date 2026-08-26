using _1_Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _1_Repository.Config
{
    public class CustomerAddressConfiguration : IEntityTypeConfiguration<CustomerAddress>
    {
        public void Configure(EntityTypeBuilder<CustomerAddress> builder)
        {
            builder.HasKey(ca => ca.Id);

            builder.Property(ca => ca.Id)
                .ValueGeneratedOnAdd();

            builder.Property(ca => ca.Title)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(ca => ca.RecipientName)
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(ca => ca.Phone)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(ca => ca.City)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(ca => ca.Street)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(ca => ca.BuildingNumber)
                .HasMaxLength(50);

            builder.Property(ca => ca.PostalCode)
                .HasMaxLength(20);

            builder.HasOne(ca => ca.Customer)
                .WithMany(c => c.CustomerAddresses)
                .HasForeignKey(ca => ca.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
