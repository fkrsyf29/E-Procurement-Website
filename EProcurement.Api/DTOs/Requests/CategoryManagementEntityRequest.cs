namespace EProcurement.Api.DTOs.Requests
{
    public class CategoryManagementEntityRequest
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; } = true;
        public string? User { get; set; } // CreatedBy or UpdatedBy

        // Soft Delete Flags
        public bool? IsDeleted { get; set; }
        public string? DeletedBy { get; set; }
    }

    public class CategoryManagementCreateRequest : CategoryManagementEntityRequest { }
    public class CategoryManagementUpdateRequest : CategoryManagementEntityRequest
    {
        public int CategoryID { get; set; }
    }

    public class ClassificationCreateRequest : CategoryManagementEntityRequest
    {
        public int CategoryID { get; set; }
    }

    public class ClassificationUpdateRequest : CategoryManagementEntityRequest
    {
        public int ClassificationID { get; set; }
        public int CategoryID { get; set; }
    }


    public class SubClassificationCreateRequest : CategoryManagementEntityRequest
    {
        public int ClassificationID { get; set; }
    }

    public class SubClassificationUpdateRequest : CategoryManagementEntityRequest
    {
        public int SubClassificationID { get; set; }
        public int ClassificationID { get; set; }
    }
}