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
    public class ClinicalCaseConfiguration : IEntityTypeConfiguration<ClinicalCase>
    {
        public void Configure(EntityTypeBuilder<ClinicalCase> builder)
        {
            builder.ToTable("ClinicalCases");
            builder.HasKey(c => c.Id);

            builder.Property(c => c.ProcedureType).IsRequired().HasMaxLength(100);
            builder.Property(c => c.Description).HasMaxLength(1000);
            builder.Property(c => c.ExternalReference).HasMaxLength(100);

            builder.HasOne(c => c.Patient)
                   .WithMany(p => p.ClinicalCases)
                   .HasForeignKey(c => c.PatientId);
        }
    }
}
