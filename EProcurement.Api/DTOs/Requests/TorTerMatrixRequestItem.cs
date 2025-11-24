namespace EProcurement.Api.DTOs.Requests
{
    public class TorTerMatrixRequestItem
    {
        public int ItemDefinitionID { get; set; }
        public string? DefaultParameter { get; set; }
        public string? DefaultRequirement { get; set; }
        public string? DefaultDescription { get; set; }
    }

    public class TorTerMatrixSaveRequest
    {
        public int SubClassificationID { get; set; }
        public List<TorTerMatrixRequestItem> Items { get; set; } = new();
        public string CreatedBy { get; set; }
    }
}