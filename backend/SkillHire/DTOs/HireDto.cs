using SkillHire.Models;

namespace SkillHire.Dtos
{
    public class HireCreateDto
    {
        public int ClientId { get; set; }
        public int WorkerId { get; set; }
        public DateTime Date { get; set; }
        public string? Notes { get; set; }
    }
}

namespace SkillHire.Dtos
{
    public class HireDto
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public int WorkerId { get; set; }
        public DateTime Date { get; set; }
        public string? Notes { get; set; }
        public HireStatus Status { get; set; }
    }
}

namespace SkillHire.Dtos
{
    public class HireStatusUpdateDto
    {
        public HireStatus Status { get; set; }
    }
}
