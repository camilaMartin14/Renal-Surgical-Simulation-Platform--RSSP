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
    public class TelemetryEventConfiguration : IEntityTypeConfiguration<TelemetryEvent>
    {
        public void Configure(EntityTypeBuilder<TelemetryEvent> builder)
        {
            builder.ToTable("TelemetryEvents");
            builder.HasKey(t => t.Id);

            builder.Property(t => t.Timestamp).IsRequired();
            builder.Property(t => t.EventType).IsRequired().HasMaxLength(100);
            builder.Property(t => t.Data).HasMaxLength(2000);

            builder.HasIndex(t => t.AttemptId);

            builder.HasOne(t => t.Attempt)
                   .WithMany(a => a.TelemetryEvents)
                   .HasForeignKey(t => t.AttemptId);
        }
    }
}
