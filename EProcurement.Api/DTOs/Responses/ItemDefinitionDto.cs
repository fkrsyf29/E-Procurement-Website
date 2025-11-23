namespace EProcurement.Api.DTOs.Responses
{
    public class ItemDefinitionDto
    {
        public int ItemDefinitionID { get; set; }
        public string Code { get; set; }
        public string Label { get; set; }
        public string Category { get; set; } // TOR atau TER
        public int Order { get; set; }
        public bool IsActive { get; set; }
        public string? ValidationSource { get; set; }

        public DateTime CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string? DeletedBy { get; set; }
    }
}