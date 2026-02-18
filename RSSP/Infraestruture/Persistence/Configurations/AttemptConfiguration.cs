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
    public class AttemptConfiguration : IEntityTypeConfiguration<Attempt>
    {
        public void Configure(EntityTypeBuilder<Attempt> builder)
        {
            builder.ToTable("Attempts");
            builder.HasKey(a => a.Id);

            builder.Property(a => a.GameKey).HasMaxLength(50).IsRequired();
            builder.Property(a => a.GameDifficulty).HasMaxLength(20).IsRequired();
            builder.Property(a => a.TrajectoryScore).HasPrecision(5, 2);
            builder.Property(a => a.PrecisionScore).HasPrecision(5, 2);
            builder.Property(a => a.SmoothnessScore).HasPrecision(5, 2);
            builder.Property(a => a.CompletionStatus).HasMaxLength(20).IsRequired();

            builder.HasOne(a => a.User)
                   .WithMany(u => u.Attempts)
                   .HasForeignKey(a => a.UserId);

            builder.HasOne(a => a.Test)
                   .WithMany(t => t.Attempts)
                   .HasForeignKey(a => a.TestId);
        }
    }
}
