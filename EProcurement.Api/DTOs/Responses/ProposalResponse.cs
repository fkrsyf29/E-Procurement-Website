namespace EProcurement.Api.DTOs.Responses
{
    public class ProposalResponse
    {
        public long ProposalID { get; set; }
        public string ProposalNo { get; set; }
        public string Title { get; set; }
        public string Status { get; set; }
        public decimal Amount { get; set; }

        public string JobsiteName { get; set; }
        public string DepartmentName { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }

        // Info Workflow Baru
        public string CurrentStepName { get; set; }
        public string RequiredRoleName { get; set; } // Untuk display "Waiting for Manager"

        public List<BudgetItemResponse> BudgetItems { get; set; } = new();
        public List<RequirementResponse> Requirements { get; set; } = new();
        public List<HistoryResponse> History { get; set; } = new();
    }

    public class BudgetItemResponse
    {
        public string MaterialName { get; set; }
        public decimal Qty { get; set; }
        public decimal Price { get; set; }
        public string UomName { get; set; }
        public decimal TotalPrice => Qty * Price;
    }

    public class RequirementResponse
    {
        public string Type { get; set; }
        public string Label { get; set; }
        public string RequirementValue { get; set; }
        public bool IsChecked { get; set; }
    }

    public class HistoryResponse
    {
        public string Action { get; set; }
        public string ActorName { get; set; }
        public string RoleName { get; set; }
        public string Comment { get; set; }
        public string StepName { get; set; }
        public DateTime ActionDate { get; set; }
    }
}