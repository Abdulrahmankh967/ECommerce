using _1_Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _1_Repository.Config
{
    public class CouponUsageConfiguration : IEntityTypeConfiguration<CouponUsage>
    {
        public void Configure(EntityTypeBuilder<CouponUsage> builder)
        {
            builder.HasKey(cu => cu.Id);

            builder.Property(cu => cu.Id)
                .ValueGeneratedOnAdd();

            builder.Property(cu => cu.UsedAt)
                .IsRequired();

            builder.HasOne(cu => cu.Coupon)
                .WithMany(c => c.CouponUsages)
                .HasForeignKey(cu => cu.CouponId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(cu => cu.Customer)
                .WithMany(c => c.CouponUsages)
                .HasForeignKey(cu => cu.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(cu => cu.Order)
                .WithOne(o => o.CouponUsage)
                .HasForeignKey<CouponUsage>(cu => cu.OrderId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
