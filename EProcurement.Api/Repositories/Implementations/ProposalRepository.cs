using System.Data;
using Dapper;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.Proposal;
using Microsoft.Data.SqlClient;

namespace EProcurement.Api.Repositories.Implementations
{
    public class ProposalRepository : IProposalRepository
    {
        private readonly string _connectionString;

        public ProposalRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<long> CreateAsync(CreateProposalRequest request)
        {
            using var db = new SqlConnection(_connectionString);
            await db.OpenAsync();
            using var tran = db.BeginTransaction();

            try
            {
                // 1. Header (SP akan otomatis cari Matrix & Step Awal)
                var proposalId = await db.ExecuteScalarAsync<long>(
                    ProposalStoredProcs.Create,
                    new
                    {
                        request.ProposalNo,
                        request.Title,
                        request.CategoryID,
                        request.ClassificationID,
                        request.SubClassificationID,
                        request.JobsiteID,
                        request.DepartmentID,
                        CreatorID = request.UserId,
                        CreatedBy = request.UserName,
                        request.Amount,
                        request.Description,
                        request.ScopeOfWork,
                        request.Analysis,
                        request.FundingSourceID,
                        request.ContractTypeID
                    },
                    tran, commandType: CommandType.StoredProcedure
                );

                // 2. Budget Items
                foreach (var item in request.BudgetItems)
                {
                    await db.ExecuteAsync(ProposalStoredProcs.InsertBudgetItem, new
                    {
                        ProposalID = proposalId,
                        item.MaterialID,
                        item.MaterialName,
                        item.Qty,
                        Price = item.EstimatedPrice,
                        item.Currency,
                        item.UomID
                    }, tran, commandType: CommandType.StoredProcedure);
                }

                // 3. Requirements
                foreach (var req in request.Requirements)
                {
                    await db.ExecuteAsync(ProposalStoredProcs.InsertRequirement, new
                    {
                        ProposalID = proposalId,
                        req.Type,
                        req.Label,
                        req.Parameter,
                        req.RequirementValue,
                        req.Description,
                        req.IsChecked
                    }, tran, commandType: CommandType.StoredProcedure);
                }

                tran.Commit();
                return proposalId;
            }
            catch
            {
                tran.Rollback();
                throw;
            }
        }

        public async Task<IEnumerable<ProposalResponse>> GetByCreatorAsync(int userId)
        {
            using var db = new SqlConnection(_connectionString);
            return await db.QueryAsync<ProposalResponse>(
                ProposalStoredProcs.GetByCreator,
                new { UserId = userId },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<ProposalResponse>> GetMyApprovalsAsync(int userId)
        {
            using var db = new SqlConnection(_connectionString);
            // SP ini melakukan JOIN ke RolePermission. 
            // Jadi backend tidak perlu tau role user apa, database yg cek "Apakah user ID ini punya permission X?"
            return await db.QueryAsync<ProposalResponse>(
                ProposalStoredProcs.GetMyApprovals,
                new { UserID = userId },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<ProposalResponse?> GetByIdAsync(long id)
        {
            using var db = new SqlConnection(_connectionString);
            using var multi = await db.QueryMultipleAsync(
                ProposalStoredProcs.GetDetail,
                new { Id = id },
                commandType: CommandType.StoredProcedure
            );

            var proposal = await multi.ReadFirstOrDefaultAsync<ProposalResponse>();
            if (proposal == null) return null;

            proposal.BudgetItems = (await multi.ReadAsync<BudgetItemResponse>()).ToList();
            proposal.Requirements = (await multi.ReadAsync<RequirementResponse>()).ToList();
            proposal.History = (await multi.ReadAsync<HistoryResponse>()).ToList();

            return proposal;
        }

        public async Task ApproveAsync(long proposalId, int actorId, string comment)
        {
            using var db = new SqlConnection(_connectionString);
            await db.ExecuteAsync(
                ProposalStoredProcs.Approve,
                new { ProposalID = proposalId, ActorID = actorId, Comment = comment },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task RejectAsync(long proposalId, int actorId, string comment)
        {
            using var db = new SqlConnection(_connectionString);
            await db.ExecuteAsync(
                ProposalStoredProcs.Reject,
                new { ProposalID = proposalId, ActorID = actorId, Comment = comment },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<ProposalResponse>> GetDashboardAsync(int userId)
        {
            using var db = new SqlConnection(_connectionString);
            var result = await db.QueryAsync<dynamic>(
                ProposalStoredProcs.GetDashboard,
                new { UserID = userId }, // SP hanya butuh UserID, dia cek permission sendiri
                commandType: CommandType.StoredProcedure
            );

            // Mapping Dynamic ke DTO Response (Sama seperti GetByCreator)
            return result.Select(p => new ProposalResponse
            {
                ProposalID = p.ProposalID,
                ProposalNo = p.ProposalNo,
                Title = p.Title,
                Status = p.Status,
                Amount = p.Amount,
                JobsiteName = p.JobsiteName,
                DepartmentName = p.DepartmentName,
                CreatedBy = p.CreatedBy,
                CreatedAt = p.CreatedAt,
                CurrentStepName = p.CurrentStepName,
                RequiredRoleName = p.RequiredRoleName,
                // List kosong untuk child items (dashboard hanya butuh header)
                BudgetItems = new List<BudgetItemResponse>(),
                Requirements = new List<RequirementResponse>(),
                History = new List<HistoryResponse>()
            });
        }

        public async Task UpdateVendorStatusAsync(long proposalId, string status, int userId, string userName)
        {
            using var db = new SqlConnection(_connectionString);
            await db.ExecuteAsync(
                ProposalStoredProcs.UpdateVendorStatus,
                new
                {
                    ProposalID = proposalId,
                    Status = status,
                    UserID = userId,
                    UserName = userName
                },
                commandType: CommandType.StoredProcedure
            );
        }
    }
}