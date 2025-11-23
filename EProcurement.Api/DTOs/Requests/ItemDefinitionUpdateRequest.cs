namespace EProcurement.Api.DTOs.Requests
{
    public class ItemDefinitionUpdateRequest
    {
        public int ItemDefinitionID { get; set; }

        public string? Code { get; set; }
        public string? Label { get; set; }
        public bool? IsActive { get; set; }
        public string? ValidationSource { get; set; }

        // Kolom audit
        public bool? IsDeleted { get; set; } 
        public DateTime? DeletedAt { get; set; }
        public string? DeletedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }

    public class ItemDefinitionReorderItemRequest
    {
        public int ItemDefinitionID { get; set; }
        public int OrderNo { get; set; }
    }

    public class ItemDefinitionReorderRequest
    {
        public List<ItemDefinitionReorderItemRequest> OrderItems { get; set; }
        public string UpdatedBy { get; set; }
    }
}