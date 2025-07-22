namespace SkillHire.Models
{
    public class WorkerService
    {
        public int WorkerProfileId { get; set; }
        public WorkerProfile WorkerProfile { get; set; }

        public int ServiceId { get; set; }
        public Service Service { get; set; }
    }
}
