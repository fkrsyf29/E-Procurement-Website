namespace EProcurement.Api.DTOs.Requests
{
    public class RoleUpdateRequest
    {
        public int RoleId { get; set; }

        public string Name { get; set; }
        public string Description { get; set; }

        public int RoleCategoryId { get; set; }
        public int? ApprovalRoleId { get; set; }

        public bool CanApprove { get; set; }
        public bool CanCreate { get; set; }
        public bool CanView { get; set; }
        public bool IsActive { get; set; }

        public List<string> PermissionIds { get; set; }  // replace all existing
        public string UpdatedBy { get; set; }

        public bool IsDeleted { get; set; }                 // jika true → update DeletedAt/By
        public string DeletedBy { get; set; }
    }
}
