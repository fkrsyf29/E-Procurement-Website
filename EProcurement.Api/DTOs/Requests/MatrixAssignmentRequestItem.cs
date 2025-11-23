namespace EProcurement.Api.DTOs.Requests
{
    public class MatrixAssignmentRequestItem
    {
        public int ItemDefinitionID { get; set; }
        public string? DefaultParameter { get; set; }
        public string? DefaultRequirement { get; set; }
        public string? DefaultDescription { get; set; }
    }

    public class MatrixSaveRequest
    {
        public int SubClassificationID { get; set; }
        public List<MatrixAssignmentRequestItem> Items { get; set; } = new();
        public string CreatedBy { get; set; }
    }
}