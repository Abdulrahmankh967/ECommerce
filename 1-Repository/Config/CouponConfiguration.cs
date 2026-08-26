using _1_Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _1_Repository.Config
{
    public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
    {
        public void Configure(EntityTypeBuilder<Coupon> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.Id)
                .ValueGeneratedOnAdd();

            builder.Property(c => c.Code)
                .HasMaxLength(50)
                .IsRequired();

            builder.HasIndex(c => c.Code)
                .IsUnique();

            builder.Property(c => c.DiscountType)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(c => c.DiscountValue)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(c => c.StartDate)
                .IsRequired();

            builder.Property(c => c.EndDate)
                .IsRequired();

            builder.Property(c => c.IsActive)
                .HasDefaultValue(true);
        }
    }
}
