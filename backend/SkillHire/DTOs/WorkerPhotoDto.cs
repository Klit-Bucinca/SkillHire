namespace SkillHire.Models
{
    public class WorkerPhotoDto
    {
        public int Id { get; set; }
        public int WorkerProfileId { get; set; }
        public string ImageUrl { get; set; }
        public string Description { get; set; }
    }
}
