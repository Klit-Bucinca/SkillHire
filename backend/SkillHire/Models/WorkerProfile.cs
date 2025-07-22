using System.ComponentModel.DataAnnotations;

namespace SkillHire.Models
{
    public class WorkerProfile
    {
        public int Id { get; set; } // Primary Key

        [Required]
        public int UserId { get; set; }
        public User User { get; set; }

        [Required]
        public string City { get; set; }

        [Required]
        public string Phone { get; set; }

        [Required]
        public int YearsExperience { get; set; }

        public string ProfilePhoto { get; set; }

        public ICollection<WorkerService> WorkerServices { get; set; }

        public ICollection<WorkerPhoto> WorkerPhotos { get; set; }
    }
}
