using System.Text.Json.Serialization;

namespace EProcurement.Api.DTOs.Response
{
    public class VendorResponseDto
    {
        public int VendorId { get; set; }
        public string ExternalVendorId { get; set; }
        public string VendorCode { get; set; }
        public string VendorName { get; set; }
        public string ContactPerson { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string Website { get; set; }

        public decimal? Rating { get; set; }
        public bool IsActive { get; set; }
        public bool IsPreferred { get; set; }

        public string CompanySize { get; set; }
        public int? YearEstablished { get; set; }
        public string Npwp { get; set; }

        // Enrichment Fields
        public string Siup { get; set; }
        public decimal? CreditLimit { get; set; }
        public string PaymentTerms { get; set; }
        public string Notes { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Nested Capabilities Object
        public VendorCapabilitiesDto Capabilities { get; set; } = new();
    }

    public class VendorCapabilitiesDto
    {
        [JsonPropertyName("subClassifications")]
        public List<SubClassificationDto> SubClassifications { get; set; } = new();

        [JsonPropertyName("kbliCodes")]
        public List<KbliDto> KbliCodes { get; set; } = new();

        [JsonPropertyName("brands")]
        public List<BrandDto> Brands { get; set; } = new();
    }

    public class SubClassificationDto
    {
        public int SubClassificationID { get; set; } // ID untuk edit
        public string SubClassificationCode { get; set; }
        public string SubClassificationName { get; set; }
        public string ClassificationName { get; set; }
        public string CategoryName { get; set; }
    }

    public class KbliDto
    {
        public string KbliId { get; set; } // String (sesuai request)
        public string Description { get; set; }
        public string Code { get; set; }
    }

    public class BrandDto
    {
        public int ExternalBrandID { get; set; } // ID untuk edit
        public string BrandName { get; set; }
    }
}