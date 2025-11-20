namespace EProcurement.Api.Entities
{
    public class Department
    {
        public int DepartmentId { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }

        public DateTime Created_At { get; set; }
        public string Created_By { get; set; }
        public DateTime? Updated_At { get; set; }
        public string Updated_By { get; set; }
        public DateTime? Deleted_At { get; set; }
        public string Deleted_By { get; set; }
    }
}
