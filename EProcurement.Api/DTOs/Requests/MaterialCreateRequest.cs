using System;
using System.ComponentModel.DataAnnotations;

namespace EProcurement.Api.DTOs.Requests
{
    public class MaterialCreateRequest
    {
        [Required]
        public string MaterialCode { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public int UOMID { get; set; }
        public int? ExternalBrandID { get; set; }
        public int? ValuationClassID { get; set; }
        public int? MaterialGroupID { get; set; }
        public int? SubClassificationID { get; set; }
        [Required]
        public int JobsiteID { get; set; }
        [Required]
        public int DepartmentID { get; set; }

        public int Qty { get; set; }
        public decimal EstimatedPrice { get; set; }
        public int? ContractTypeID { get; set; }
        [Required]
        public int VendorID { get; set; }

        public string ContractNumber { get; set; }
        public string ContractName { get; set; }
        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }

        public bool IsUnique { get; set; }
        [Required]
        public string CreatedBy { get; set; }
    }
}