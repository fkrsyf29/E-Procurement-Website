namespace EProcurement.Api.DTOs.Requests
{
    public class MatrixContractCreateRequest
    {
        public string Code { get; set; }
        public string Label { get; set; }
        public string? Description { get; set; }
        public int OrderNo { get; set; }
        public bool IsActive { get; set; } = true;

        // Kolom audit
        public string CreatedBy { get; set; }
    }
}