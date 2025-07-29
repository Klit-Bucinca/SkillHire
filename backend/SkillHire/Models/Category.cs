using System.ComponentModel.DataAnnotations;

namespace SkillHire.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public ICollection<Service>? Services { get; set; }
    }
}
