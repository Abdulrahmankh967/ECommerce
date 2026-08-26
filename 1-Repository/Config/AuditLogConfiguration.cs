using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _1_Repository.Config
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.Id)
                .ValueGeneratedOnAdd();

            builder.Property(a => a.Action)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.EntityName)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.EntityId)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.Timestamp)
                .IsRequired();

            builder.Property(a => a.IpAddress)
                .HasMaxLength(50);
        }
    }
}
