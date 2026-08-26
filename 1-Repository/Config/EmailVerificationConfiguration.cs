
using _1_Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class EmailVerificationConfiguration : IEntityTypeConfiguration<EmailVerification>
{
    public void Configure(EntityTypeBuilder<EmailVerification> builder)
    {
        
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id)
               .ValueGeneratedOnAdd();

        builder.Property(e => e.VerificationId)
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(e => e.CodeHash)
               .IsRequired()
               .HasMaxLength(500);

        builder.Property(e => e.ExpiresAt)
               .IsRequired();

        builder.Property(e => e.Attempts)
               .IsRequired();

        builder.Property(e => e.UsedAt)
               .IsRequired(false);

        builder.Property(e => e.CreatedAt)
               .IsRequired();

        builder.HasOne<Customer>()
       .WithMany()
       .HasForeignKey(r => r.CustomerId)
       .OnDelete(DeleteBehavior.Cascade);



    }
}