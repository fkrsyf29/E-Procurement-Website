namespace EProcurement.Api.SQL.Proposal
{
    public static class ProposalStoredProcs
    {
        public const string Create = "[dbo].[sp_Proposal_Create]";
        public const string InsertBudgetItem = "[dbo].[sp_ProposalBudgetItem_Insert]";
        public const string InsertRequirement = "[dbo].[sp_ProposalRequirement_Insert]";

        public const string Approve = "[dbo].[sp_Proposal_Approve]";
        public const string Reject = "[dbo].[sp_Proposal_Reject]";
        public const string UpdateVendorStatus = "[dbo].[sp_Proposal_UpdateVendorStatus]";

        public const string GetByCreator = "[dbo].[sp_Proposal_GetByCreator]";
        public const string GetMyApprovals = "[dbo].[sp_Proposal_GetMyApprovals]";
        public const string GetDetail = "[dbo].[sp_Proposal_GetDetail]";
        public const string GetDashboard = "[dbo].[sp_Proposal_GetDashboard]";
    }
}