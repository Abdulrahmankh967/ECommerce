using _1_Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _1_Repository.Config
{
    public class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
    {
        public void Configure(EntityTypeBuilder<Wishlist> builder)
        {
            builder.HasKey(w => w.Id);

            builder.Property(w => w.Id)
                .ValueGeneratedOnAdd();

            builder.Property(w => w.CreatedAt)
                .IsRequired();

            builder.HasOne(w => w.Customer)
                .WithOne(c => c.Wishlist)
                .HasForeignKey<Wishlist>(w => w.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
