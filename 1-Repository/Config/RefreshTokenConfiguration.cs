
using _1_Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Id)
               .ValueGeneratedOnAdd();

        builder.Property(r => r.RefreshTokenHash)
               .IsRequired()
               .HasMaxLength(500);

        builder.Property(r => r.RefreshTokenExpiresAt)
               .IsRequired();

        builder.Property(r => r.RefreshTokenRevokedAt)
               .IsRequired(false);

        builder.HasOne<Customer>()
               .WithMany()
               .HasForeignKey(r => r.CustomerId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
