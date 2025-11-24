namespace EProcurement.Api.DTOs.Requests
{
    public class ApprovalStepRequest
    {
        public int StepNumber { get; set; }
        public string StepName { get; set; }
        public int ApprovalRoleID { get; set; }
    }

    public class ApprovalMatrixSaveRequest
    {
        public int? MatrixID { get; set; } // Null = Create Baru, Isi = Update

        public int DepartmentID { get; set; }
        public int JobsiteID { get; set; }

        public decimal AmountMin { get; set; }
        public decimal? AmountMax { get; set; }

        public string GroupName { get; set; }
        public bool IsActive { get; set; } = true;

        public string User { get; set; } // User yang melakukan aksi (CreatedBy/UpdatedBy)

        // List Steps untuk disimpan (akan me-replace steps lama jika Update)
        public List<ApprovalStepRequest> Steps { get; set; } = new();
    }
}