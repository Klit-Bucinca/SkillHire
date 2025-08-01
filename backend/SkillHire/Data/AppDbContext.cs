using Microsoft.EntityFrameworkCore;
using SkillHire.Models;

namespace SkillHire.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<WorkerProfile> WorkerProfiles { get; set; }
        public DbSet<WorkerService> WorkerServices { get; set; }
        public DbSet<WorkerPhoto> WorkerPhotos { get; set; }
        public DbSet<Hire> Hires { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<WorkerService>()
                .HasKey(ws => new { ws.WorkerProfileId, ws.ServiceId });

            modelBuilder.Entity<WorkerPhoto>()
                .HasOne(wp => wp.WorkerProfile)
                .WithMany(wp => wp.WorkerPhotos)
                .HasForeignKey(wp => wp.WorkerProfileId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<Hire>()
                .HasOne(h => h.Client)
                .WithMany()
                .HasForeignKey(h => h.ClientId)
                .OnDelete(DeleteBehavior.Restrict);    

            modelBuilder.Entity<Hire>()
                .HasOne(h => h.Worker)
                .WithMany()
                .HasForeignKey(h => h.WorkerId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
