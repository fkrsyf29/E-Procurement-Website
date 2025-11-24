namespace EProcurement.Api.DTOs.Responses
{
    public class ApprovalStepDto
    {
        public int StepID { get; set; }
        public int MatrixID { get; set; }
        public int StepNumber { get; set; }
        public string StepName { get; set; } // Contoh: "Verificator", "Approval 1"
        public int ApprovalRoleID { get; set; }
        public string RoleName { get; set; } // Nama role (e.g., "DH User")
    }

    public class ApprovalMatrixDto
    {
        public int MatrixID { get; set; }
        public int DepartmentID { get; set; }
        public string DepartmentName { get; set; }
        public int JobsiteID { get; set; }
        public string JobsiteName { get; set; }
        public decimal AmountMin { get; set; }
        public decimal? AmountMax { get; set; } // Null berarti tidak terbatas
        public string GroupName { get; set; }
        public bool IsActive { get; set; }

        // List detail steps
        public List<ApprovalStepDto> ApprovalPath { get; set; } = new();

        // Audit logs
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
    }
}