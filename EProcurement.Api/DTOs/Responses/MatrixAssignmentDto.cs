namespace EProcurement.Api.DTOs.Responses
{
    public class MatrixAssignmentDto
    {
        public int AssignmentID { get; set; }
        public int SubClassificationID { get; set; }
        public int ItemDefinitionID { get; set; }
        public string ItemCode { get; set; }
        public string ItemCategory { get; set; } // TOR atau TER

        public string? DefaultParameter { get; set; }
        public string? DefaultRequirement { get; set; }
        public string? DefaultDescription { get; set; }
    }
}

