namespace EProcurement.Api.DTOs.Requests
{
    public class UserCreateRequest
    {
        public string Username { get; set; }
        public string Name { get; set; }
        public int RoleID { get; set; }
        public int? JobsiteID { get; set; }
        public int? DepartmentID { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string CreatedBy { get; set; }


    }
}
