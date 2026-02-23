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
    public class SimulationSessionConfiguration : IEntityTypeConfiguration<SimulationSession>
    {
        public void Configure(EntityTypeBuilder<SimulationSession> builder)
        {
            builder.ToTable("SimulationSessions");
            builder.HasKey(s => s.Id);

            builder.Property(s => s.StartedAt).IsRequired();
            builder.Property(s => s.Notes).HasMaxLength(1000);

            builder.HasOne(s => s.User)
                   .WithMany()
                   .HasForeignKey(s => s.UserId);

            builder.HasOne(s => s.Scenario)
                   .WithMany(sc => sc.SimulationSessions)
                   .HasForeignKey(s => s.ScenarioId);
        }
    }
}
