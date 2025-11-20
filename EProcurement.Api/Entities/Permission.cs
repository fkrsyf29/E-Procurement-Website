namespace EProcurement.Api.Entities
{
    public class Permission
    {
        public int PermissionID { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int PermissionCategoryID { get; set; }
        public string PermissionCategoryName { get; set; }
        public bool IsActive { get; set; }

        public DateTime Created_At { get; set; }
        public string Created_By { get; set; }
    }
}
