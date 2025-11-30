using System;

namespace EProcurement.Api.DTOs.Responses
{
    public class MaterialDto
    {
        public int MaterialID { get; set; }
        public string MaterialCode { get; set; }
        public string Description { get; set; }

        // Relasi (ID & Name hasil JOIN)
        public int UOMID { get; set; }
        public string UOMName { get; set; }

        public int? ExternalBrandID { get; set; }
        public string ExternalBrandName { get; set; }

        public int? ValuationClassID { get; set; }
        public string ValuationClassName { get; set; }

        public int? MaterialGroupID { get; set; }
        public string MaterialGroupName { get; set; }

        public int? SubClassificationID { get; set; }
        public string SubClassificationName { get; set; }

        public int JobsiteID { get; set; }
        public string JobsiteName { get; set; }

        public int DepartmentID { get; set; }
        public string DepartmentName { get; set; }

        public int Qty { get; set; }
        public decimal EstimatedPrice { get; set; }

        public int? ContractTypeID { get; set; }
        public string ContractTypeName { get; set; }

        public int VendorID { get; set; }
        public string VendorName { get; set; }

        public string ContractNumber { get; set; }
        public string ContractName { get; set; }
        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }

        public bool IsUnique { get; set; }
        public bool IsActive { get; set; }

        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}