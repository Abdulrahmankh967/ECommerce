
using _1_Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _1_Repository.Config
{
    public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
    {
        public void Configure(EntityTypeBuilder<Customer> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(c=>c.Id).ValueGeneratedOnAdd();

            builder.Property(c => c.PasswordHash)
                       .IsRequired() 
                       .HasMaxLength(500);


            builder.Property(p=>p.FullName)
                .HasColumnType("NVARCHAR")
                .HasMaxLength(100);



           
        }
    }
}
