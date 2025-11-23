namespace EProcurement.Api.DTOs.Requests
{
    public class MatrixContractUpdateRequest
    {
        // ID yang akan digunakan di Stored Procedure
        public int MatrixContractID { get; set; }

        public string? Code { get; set; }
        public string? Label { get; set; }
        public string? Description { get; set; }
        public int? OrderNo { get; set; }
        public bool? IsActive { get; set; }

        // Kolom audit
        public string? UpdatedBy { get; set; }

        // Soft Delete Fields (Digunakan saat Deactivate)
        public bool? IsSoftDelete { get; set; } = false;
        public DateTime? DeletedAt { get; set; } // <--- HARUS DateTime? (Nullable)
        public string? DeletedBy { get; set; }  // <--- HARUS string? (Nullable)
    }

    public class ReorderItemRequest
    {
        public int MatrixContractID { get; set; }
        public int OrderNo { get; set; }
    }

    public class MatrixContractReorderRequest
    {
        public List<ReorderItemRequest> OrderItems { get; set; }
        public string UpdatedBy { get; set; }
    }
}