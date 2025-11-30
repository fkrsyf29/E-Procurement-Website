namespace EProcurement.Api.DTOs.Request
{
    public class VendorUpdateRequest
    {
        public string ContactPerson { get; set; }
        public string ContactEmail { get; set; }
        public string ContactPhone { get; set; } // No HP PIC

        public decimal? Rating { get; set; }
        public bool IsActive { get; set; }
        public bool IsPreferred { get; set; }

        public string CompanySize { get; set; }
        public int? YearEstablished { get; set; }

        public string Siup { get; set; }
        public decimal? CreditLimit { get; set; }
        public string PaymentTerms { get; set; }
        public string Notes { get; set; }

        public string UpdatedBy { get; set; }

        // Relational IDs (Array)
        public List<int> SubClassificationIds { get; set; } = new();
        public List<string> KbliIds { get; set; } = new(); // STRING ID
        public List<int> BrandIds { get; set; } = new();
    }
}