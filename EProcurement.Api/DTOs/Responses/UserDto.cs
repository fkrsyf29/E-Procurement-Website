namespace EProcurement.Api.DTOs.Responses
{
    public class UserDto
    {
        public int UserID { get; set; }
        public string Username { get; set; }               
        public string Name { get; set; }
        public string RoleName { get; set; }
        public string Jobsite { get; set; }
        public string Department { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public DateTime? LastPasswordChange { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string DeletedBy { get; set; }
    }
}
