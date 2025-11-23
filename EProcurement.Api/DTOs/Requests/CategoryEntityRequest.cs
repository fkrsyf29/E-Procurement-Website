namespace EProcurement.Api.DTOs.Requests
{
    public class CategoryEntityRequest
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; } = true;
        public string? User { get; set; } // CreatedBy or UpdatedBy

        // Soft Delete Flags
        public bool? IsDeleted { get; set; }
        public string? DeletedBy { get; set; }
    }

    public class CategoryCreateRequest : CategoryEntityRequest { }
    public class CategoryUpdateRequest : CategoryEntityRequest
    {
        public int CategoryID { get; set; }
    }

    public class ClassificationCreateRequest : CategoryEntityRequest
    {
        public int CategoryID { get; set; }
    }

    public class ClassificationUpdateRequest : CategoryEntityRequest
    {
        public int ClassificationID { get; set; }
        public int CategoryID { get; set; }
    }


    public class SubClassificationCreateRequest : CategoryEntityRequest
    {
        public int ClassificationID { get; set; }
    }

    public class SubClassificationUpdateRequest : CategoryEntityRequest
    {
        public int SubClassificationID { get; set; }
        public int ClassificationID { get; set; }
    }
}