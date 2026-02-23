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
    public class AttemptMetricConfiguration : IEntityTypeConfiguration<AttemptMetric>
    {
        public void Configure(EntityTypeBuilder<AttemptMetric> builder)
        {
            builder.ToTable("AttemptMetrics");
            builder.HasKey(m => m.Id);

            builder.Property(m => m.Name).IsRequired().HasMaxLength(100);
            builder.Property(m => m.Unit).HasMaxLength(50);
            builder.Property(m => m.Category).HasMaxLength(100);
            builder.Property(m => m.Value).HasPrecision(18, 4);

            builder.HasIndex(m => m.AttemptId);

            builder.HasOne(m => m.Attempt)
                   .WithMany(a => a.Metrics)
                   .HasForeignKey(m => m.AttemptId);
        }
    }
}
