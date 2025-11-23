namespace EProcurement.Api.DTOs.Responses
{
    public class RegionDto
    {
        public int RegionID { get; set; }
        public string Name { get; set; }               
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
    }
}
