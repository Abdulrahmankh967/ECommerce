
using _1_Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _1_Repository.Config
{
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.HasKey(x => new
            {
                x.Id,
            });

            builder.Property(x => x.UnitPrice)
                .HasColumnType("decimal(18,2)");

            builder.HasOne(x => x.Order)
                .WithMany(x => x.OrderItems)
                .HasForeignKey(x => x.OrderId);


            builder.HasOne(x => x.Product)
                .WithMany(x=>x.OrderItems)
                .HasForeignKey(x => x.ProductId);

        }
    }
}
