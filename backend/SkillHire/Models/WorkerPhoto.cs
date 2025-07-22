using System.ComponentModel.DataAnnotations;

namespace SkillHire.Models
{
    public class WorkerPhoto
    {
        public int Id { get; set; }

        [Required]
        public int WorkerProfileId { get; set; } 
        public WorkerProfile WorkerProfile { get; set; }

        [Required]
        public string ImageUrl { get; set; } 

        public string Description { get; set; }
    }
}
