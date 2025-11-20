namespace EProcurement.Api.DTOs.Responses
{
    public class JobsiteDto
    {
        public int JobsiteID { get; set; }
        public string Code { get; set; }               
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
    }
}
