namespace EProcurement.Api.DTOs.Responses
{
    public class MatrixContractDto
    {
        public int MatrixContractID { get; set; }
        public string Code { get; set; }
        public string Label { get; set; }
        public string? Description { get; set; }
        public int OrderNo { get; set; }
        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string? DeletedBy { get; set; }
    }
}