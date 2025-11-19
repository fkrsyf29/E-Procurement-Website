namespace EProcurement.Api.Entities
{
    public class User
    {
        public int Id { get; set; }

        public string Username { get; set; }
        public string Name { get; set; }

        public int Role_Id { get; set; }
        public int? Jobsite_Id { get; set; }
        public int? Department_Id { get; set; }

        public string Email { get; set; }
        public string Phone { get; set; }

        public DateTime LastPasswordChange { get; set; }
        public bool IsActive { get; set; }

        public DateTime Created_At { get; set; }
        public string Created_By { get; set; }
        public DateTime? Updated_At { get; set; }
        public string Updated_By { get; set; }
        public DateTime? Deleted_At { get; set; }
        public string Deleted_By { get; set; }
    }
}
