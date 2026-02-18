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
    public class TestConfiguration : IEntityTypeConfiguration<Test>
    {
        public void Configure(EntityTypeBuilder<Test> builder)
        {
            builder.ToTable("Tests");
            builder.HasKey(t => t.Id);

            builder.Property(t => t.Name).HasMaxLength(250).IsRequired();
            builder.Property(t => t.ProcedureType).HasMaxLength(100).IsRequired();
            builder.Property(t => t.Objective).HasMaxLength(500).IsRequired();
            builder.Property(t => t.SimulatedRegion).HasMaxLength(100).IsRequired();

            builder.HasOne(t => t.Difficulty)
                   .WithMany(d => d.Tests)
                   .HasForeignKey(t => t.DifficultyId);
        }
    }
}
