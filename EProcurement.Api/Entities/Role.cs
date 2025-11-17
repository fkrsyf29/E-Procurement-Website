namespace EProcurement.Api.Entities
{
    public class Role
    {
        public int Id { get; set; }
        public string Code { get; set; }          // ROLE_0001
        public string Name { get; set; }
        public string Description { get; set; }

        public int RoleCategoryId { get; set; }
        public int? ApprovalRoleId { get; set; }

        public bool CanApprove { get; set; }
        public bool CanCreate { get; set; }
        public bool CanView { get; set; }
        public bool IsActive { get; set; }
        public bool IsSystemGenerated { get; set; }

        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string DeletedBy { get; set; }
    }
}
