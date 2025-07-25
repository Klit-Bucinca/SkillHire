namespace SkillHire.Models
{
    public class WorkerProfileDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string City { get; set; }
        public string Phone { get; set; }
        public int YearsExperience { get; set; }
        public string ProfilePhoto { get; set; }

        public List<string> Services { get; set; } = new();
        public List<WorkerPhotoDto> Photos { get; set; } = new();
    }
}
