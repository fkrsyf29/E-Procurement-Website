namespace EProcurement.Api.DTOs.Requests
{
    public class UserUpdateRequest
    {
        public int UserID { get; set; }
        public string Username { get; set; }
        public string Name { get; set; }
        public int RoleID { get; set; }
        public int? JobsiteID { get; set; }
        public int? DepartmentID { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public bool IsActive { get; set; }
        public string? UpdatedBy { get; set; }

        public bool? IsDeleted { get; set; } = false;
        public string? DeletedBy { get; set; }
    }
}
