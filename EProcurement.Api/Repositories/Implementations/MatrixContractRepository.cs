using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.MatrixContracts;

namespace EProcurement.Api.Repositories.Implementations
{
    public class MatrixContractRepository : DapperRepository, IMatrixContractRepository
    {
        public MatrixContractRepository(DbConnectionFactory connectionFactory)
            : base(connectionFactory)
        {
        }

        public async Task<IEnumerable<MatrixContractDto>> GetAllAsync()
        {
            return await QueryAsync<MatrixContractDto>(MatrixContractQueries.GetAll);
        }
        public async Task<MatrixContractDto?> GetByIdAsync(int matrixContractId)
        {
            var results = await QueryAsync<MatrixContractDto>(
                MatrixContractQueries.GetById,
                new { MatrixContractID = matrixContractId });

            // Ambil hasil pertama (atau null jika kosong)
            return results.FirstOrDefault();
        }

        public async Task<MatrixContractDto> InsertAsync(MatrixContractCreateRequest req)
        {
            return await QuerySingleAsync<MatrixContractDto>(MatrixContractCommands.Insert, new
            {
                req.Code,
                req.Label,
                req.Description,
                req.OrderNo,
                req.IsActive,
                req.CreatedBy
            });
        }

        public async Task<MatrixContractDto> UpdateAsync(MatrixContractUpdateRequest req)
        {
            // Perhitungan DeletedAt/DeletedBy dilakukan di Repository/Service
            DateTime? deletedAt = null;
            string? deletedBy = null;

            if (req.IsSoftDelete == true)
            {
                deletedAt = DateTime.UtcNow;
                deletedBy = req.UpdatedBy; // Yang mengupdate saat soft delete adalah DeletedBy
                req.IsActive = false; // Memastikan IsActive menjadi false saat soft delete
            }
            // Note: Jika IsSoftDelete=false, DeletedAt/DeletedBy akan tetap NULL (atau yang sudah ada)

            return await QuerySingleAsync<MatrixContractDto>(MatrixContractCommands.Update, new
            {
                req.MatrixContractID,
                req.Code,
                req.Label,
                req.Description,
                req.OrderNo,
                req.IsActive,
                req.UpdatedBy,
                DeletedAt = deletedAt, // Mengirim nilai yang dihitung
                DeletedBy = deletedBy  // Mengirim nilai yang dihitung
            });
        }

        public async Task UpdateOrderAsync(MatrixContractReorderRequest req)
        {
            // NOTE: Dapper membutuhkan DynamicParameters dan SqlDbType.Structured untuk TVP
            var orderTable = new System.Data.DataTable();
            orderTable.Columns.Add("MatrixContractID", typeof(int));
            orderTable.Columns.Add("OrderNo", typeof(int));

            foreach (var item in req.OrderItems)
            {
                orderTable.Rows.Add(item.MatrixContractID, item.OrderNo);
            }

            var parameters = new DynamicParameters();
            parameters.Add("@OrderList", orderTable.AsTableValuedParameter("dbo.MatrixConditionOrderType")); // Harus sesuai dengan nama Type Table SQL
            parameters.Add("@UpdatedBy", req.UpdatedBy);

            await ExecuteAsync(MatrixContractCommands.Reorder, parameters);
        }
    }
}