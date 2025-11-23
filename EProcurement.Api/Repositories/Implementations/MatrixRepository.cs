using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using System.Data;

namespace EProcurement.Api.Repositories.Implementations
{
    // INTERFACE
    public interface IMatrixRepository
    {
        Task<IEnumerable<MatrixAssignmentDto>> GetBySubClassificationAsync(int subClassificationId);
        Task SaveMatrixAsync(MatrixSaveRequest req);
    }

    // IMPLEMENTATION
    public class MatrixRepository : DapperRepository, IMatrixRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public MatrixRepository(DbConnectionFactory connectionFactory) : base(connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<MatrixAssignmentDto>> GetBySubClassificationAsync(int subClassificationId)
        {
            return await QueryAsync<MatrixAssignmentDto>(
                "EXEC SP_Matrix_GetBySubClassification @SubClassificationID",
                new { SubClassificationID = subClassificationId }
            );
        }

        public async Task SaveMatrixAsync(MatrixSaveRequest req)
        {
            var table = new DataTable();
            table.Columns.Add("ItemDefinitionID", typeof(int));
            table.Columns.Add("DefaultParameter", typeof(string));
            table.Columns.Add("DefaultRequirement", typeof(string));
            table.Columns.Add("DefaultDescription", typeof(string));

            foreach (var item in req.Items)
            {
                table.Rows.Add(item.ItemDefinitionID, item.DefaultParameter, item.DefaultRequirement, item.DefaultDescription);
            }

            var parameters = new DynamicParameters();
            parameters.Add("@SubClassificationID", req.SubClassificationID);
            parameters.Add("@ItemList", table.AsTableValuedParameter("dbo.MatrixAssignmentType"));
            parameters.Add("@CreatedBy", req.CreatedBy);

            await ExecuteAsync("EXEC SP_Matrix_Save @SubClassificationID, @ItemList, @CreatedBy", parameters);
        }
    }
}