using System;
using System.ComponentModel.DataAnnotations;

namespace EProcurement.Api.DTOs.Requests
{
    public class MaterialUpdateRequest
    {
        [Required]
        public int MaterialID { get; set; }
        public string MaterialCode { get; set; }
        public string Description { get; set; }
        public int UOMID { get; set; }
        public int? ExternalBrandID { get; set; }
        public int? ValuationClassID { get; set; }
        public int? MaterialGroupID { get; set; }
        public int? SubClassificationID { get; set; }
        public int JobsiteID { get; set; }
        public int DepartmentID { get; set; }

        public int Qty { get; set; }
        public decimal EstimatedPrice { get; set; }
        public int? ContractTypeID { get; set; }
        public int VendorID { get; set; }

        public string ContractNumber { get; set; }
        public string ContractName { get; set; }
        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }

        public bool IsUnique { get; set; }
        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; } // Flag untuk soft delete
        public string UpdatedBy { get; set; }
        public string DeletedBy { get; set; } // Diisi jika IsDeleted = true
    }
}