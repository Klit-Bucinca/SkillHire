using System.ComponentModel.DataAnnotations;

namespace SkillHire.Models
{
    public enum HireStatus
    {
        Pending = 0,
        Accepted = 1,
        Rejected = 2
    }

    public class Hire
    {
        public int Id { get; set; }

        public int ClientId { get; set; }         
        public User Client { get; set; }

        public int WorkerId { get; set; }       
        public User Worker { get; set; }

        public DateTime Date { get; set; }
        public string? Notes { get; set; }  
        public HireStatus Status { get; set; } = HireStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
