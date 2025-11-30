using System.ComponentModel.DataAnnotations;

namespace EProcurement.Api.DTOs.Requests
{
    // Base context untuk mempermudah passing parameter user
    public class UserContextRequest
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string RoleName { get; set; } // Optional, untuk logging
    }

    public class CreateProposalRequest : UserContextRequest
    {
        [Required] public string ProposalNo { get; set; }
        [Required] public string Title { get; set; }

        public int CategoryID { get; set; }
        public int ClassificationID { get; set; }
        public int SubClassificationID { get; set; }

        public int JobsiteID { get; set; }
        public int DepartmentID { get; set; }

        public decimal Amount { get; set; }
        public string Description { get; set; }
        public string ScopeOfWork { get; set; }
        public string Analysis { get; set; }

        public int FundingSourceID { get; set; }
        public int ContractTypeID { get; set; }

        public List<ProposalBudgetItemRequest> BudgetItems { get; set; } = new();
        public List<ProposalRequirementRequest> Requirements { get; set; } = new();
    }

    public class ProposalBudgetItemRequest
    {
        public int? MaterialID { get; set; }
        public string MaterialName { get; set; }
        public decimal Qty { get; set; }
        public decimal EstimatedPrice { get; set; } // Mapping ke Price
        public string Currency { get; set; } = "USD";
        public int UomID { get; set; }
    }

    public class ProposalRequirementRequest
    {
        public string Type { get; set; } // 'TOR' or 'TER'
        public string Label { get; set; }
        public string Parameter { get; set; }
        public string RequirementValue { get; set; }
        public string Description { get; set; }
        public bool IsChecked { get; set; }
    }

    public class ApproveProposalRequest : UserContextRequest
    {
        public long ProposalID { get; set; }
        public string Action { get; set; } // 'Approve' or 'Reject'
        public string Comment { get; set; }
    }

    public class UpdateVendorStatusRequest
    {
        public long ProposalID { get; set; }
        public string VendorConfirmationStatus { get; set; }
    }
}