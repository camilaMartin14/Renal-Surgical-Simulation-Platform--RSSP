using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestruture.Persistence.Configurations
{
    public class FeedbackConfiguration : IEntityTypeConfiguration<Feedback>
    {
        public void Configure(EntityTypeBuilder<Feedback> builder)
        {
            builder.ToTable("Feedback");
            builder.HasKey(f => f.Id);

            builder.Property(f => f.Comment).HasMaxLength(1000).IsRequired();
            builder.Property(f => f.CreatedBy).HasMaxLength(100).IsRequired();

            builder.HasOne(f => f.Attempt)
                   .WithMany(a => a.Feedbacks)
                   .HasForeignKey(f => f.AttemptId);
        }
    }
}
