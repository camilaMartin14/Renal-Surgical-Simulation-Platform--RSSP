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
    public class ScenarioConfiguration : IEntityTypeConfiguration<Scenario>
    {
        public void Configure(EntityTypeBuilder<Scenario> builder)
        {
            builder.ToTable("Scenarios");
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Key).IsRequired().HasMaxLength(50);
            builder.Property(s => s.Name).IsRequired().HasMaxLength(250);
            builder.Property(s => s.Description).HasMaxLength(1000);

            builder.Property(s => s.IsActive).HasColumnType("bit");

            builder.HasIndex(s => s.Key).IsUnique();

            builder.HasOne(s => s.Test)
                   .WithMany(t => t.Scenarios)
                   .HasForeignKey(s => s.TestId);

            builder.HasOne(s => s.ClinicalCase)
                   .WithMany(c => c.Scenarios)
                   .HasForeignKey(s => s.ClinicalCaseId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
