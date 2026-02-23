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
    public class TelemetrySampleConfiguration : IEntityTypeConfiguration<TelemetrySample>
    {
        public void Configure(EntityTypeBuilder<TelemetrySample> builder)
        {
            builder.ToTable("TelemetrySamples");
            builder.HasKey(t => t.Id);

            builder.Property(t => t.Timestamp).IsRequired();
            builder.Property(t => t.X).HasPrecision(18, 4);
            builder.Property(t => t.Y).HasPrecision(18, 4);
            builder.Property(t => t.NormalX).HasPrecision(18, 4);
            builder.Property(t => t.NormalY).HasPrecision(18, 4);
            builder.Property(t => t.Velocity).HasPrecision(18, 4);

            builder.HasIndex(t => t.AttemptId);

            builder.HasOne(t => t.Attempt)
                   .WithMany(a => a.TelemetrySamples)
                   .HasForeignKey(t => t.AttemptId);
        }
    }
}
