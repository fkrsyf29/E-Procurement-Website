using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.ApprovalMatrix;
using System.Data;

namespace EProcurement.Api.Repositories.Implementations
{
    public class ApprovalMatrixRepository : DapperRepository, IApprovalMatrixRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public ApprovalMatrixRepository(DbConnectionFactory connectionFactory) : base(connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<ApprovalMatrixDto>> GetAllAsync()
        {
            using var connection = _connectionFactory.CreateConnection();

            // Menggunakan QueryMultiple karena SP mengembalikan Header dan Detail secara terpisah
            // agar lebih efisien daripada Join besar yang berulang-ulang
            using var multi = await connection.QueryMultipleAsync(ApprovalMatrixCommands.GetAll);

            var matrices = (await multi.ReadAsync<ApprovalMatrixDto>()).ToList();
            var steps = (await multi.ReadAsync<ApprovalStepDto>()).ToList();

            // Mapping Steps ke Matrix Header di memori
            foreach (var matrix in matrices)
            {
                matrix.ApprovalPath = steps
                    .Where(s => s.MatrixID == matrix.MatrixID)
                    .OrderBy(s => s.StepNumber)
                    .ToList();
            }

            return matrices;
        }

        public async Task<int> SaveAsync(ApprovalMatrixSaveRequest req)
        {
            // 1. Siapkan DataTable untuk Table-Valued Parameter (TVP)
            // Pastikan nama kolom dan tipe data SAMA PERSIS dengan TYPE di SQL [dbo].[ApprovalStepType]
            var stepsTable = new DataTable();
            stepsTable.Columns.Add("StepNumber", typeof(int));
            stepsTable.Columns.Add("StepName", typeof(string));
            stepsTable.Columns.Add("ApprovalRoleID", typeof(int));

            foreach (var step in req.Steps)
            {
                stepsTable.Rows.Add(step.StepNumber, step.StepName, step.ApprovalRoleID);
            }

            // 2. Siapkan Parameter Dapper
            var parameters = new DynamicParameters();
            parameters.Add("@MatrixID", req.MatrixID); // Null jika Insert
            parameters.Add("@DepartmentID", req.DepartmentID);
            parameters.Add("@JobsiteID", req.JobsiteID);
            parameters.Add("@AmountMin", req.AmountMin);
            parameters.Add("@AmountMax", req.AmountMax);
            parameters.Add("@GroupName", req.GroupName);
            parameters.Add("@IsActive", req.IsActive);
            parameters.Add("@User", req.User);

            // Parameter TVP
            parameters.Add("@Steps", stepsTable.AsTableValuedParameter("dbo.ApprovalStepType"));

            // 3. Eksekusi SP dan ambil ID baru/update
            return await QuerySingleAsync<int>(ApprovalMatrixCommands.Save, parameters);
        }

        public async Task DeleteAsync(int id, string user)
        {
            await ExecuteAsync(ApprovalMatrixCommands.Delete, new { MatrixID = id, User = user });
        }
    }
}