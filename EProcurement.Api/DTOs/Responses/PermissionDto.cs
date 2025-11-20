namespace EProcurement.Api.DTOs.Responses
{
    public class PermissionDto
    {
        public int PermissionID { get; set; }
        public string Code { get; set; }               
        public string Name { get; set; }
        public string Description { get; set; }
        public int PermissionCategoryID { get; set; }
        public string Category { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
    }
}
