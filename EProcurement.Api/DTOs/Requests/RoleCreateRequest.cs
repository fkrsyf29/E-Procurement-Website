namespace EProcurement.Api.DTOs.Requests
{
    public class RoleCreateRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }

        public int RoleCategoryId { get; set; }
        public int? ApprovalRoleId { get; set; }

        public bool CanApprove { get; set; }
        public bool CanCreate { get; set; }
        public bool CanView { get; set; }
        public bool IsActive { get; set; }
        public bool IsSystemGenerated { get; set; }

        public List<string> PermissionIds { get; set; }   // Insert ke RolePermission
        public string CreatedBy { get; set; }
    }
}
