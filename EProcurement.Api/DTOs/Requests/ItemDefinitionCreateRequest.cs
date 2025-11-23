namespace EProcurement.Api.DTOs.Requests
{
    public class ItemDefinitionCreateRequest
    {
        public string Code { get; set; }
        public string Label { get; set; }
        public string Category { get; set; } // TOR atau TER
        public int Order { get; set; }
        public bool IsActive { get; set; } = true;
        public string? ValidationSource { get; set; }

        public string CreatedBy { get; set; }
    }
}