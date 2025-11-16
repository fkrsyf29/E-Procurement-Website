namespace EProcurement.Api.Entities
{
    public class Role
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public int Role_Category_Id { get; set; }
        public int? Approval_Role_Id { get; set; }

        public bool CanApprove { get; set; }
        public bool CanCreate { get; set; }
        public bool CanView { get; set; }
        public bool IsActive { get; set; }
        public bool IsSystemGenerated { get; set; }

        public DateTime Created_At { get; set; }
        public string Created_By { get; set; }
        public DateTime? Updated_At { get; set; }
        public string Updated_By { get; set; }
        public DateTime? Deleted_At { get; set; }
        public string Deleted_By { get; set; }
    }
}
