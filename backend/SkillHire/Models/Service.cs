using System.ComponentModel.DataAnnotations;

namespace SkillHire.Models
{
    public class Service
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        public ICollection<WorkerService>? WorkerServices { get; set; }
    }
}
