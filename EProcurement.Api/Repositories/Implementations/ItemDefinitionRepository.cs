using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.ItemDefinitions;
using System.Data; // Diperlukan untuk DataTable dan TVP

namespace EProcurement.Api.Repositories.Implementations
{
    public class ItemDefinitionRepository : DapperRepository, IItemDefinitionRepository
    {
        public ItemDefinitionRepository(DbConnectionFactory connectionFactory)
            : base(connectionFactory)
        {
        }

        public async Task<IEnumerable<ItemDefinitionDto>> GetAllAsync()
        {
            return await QueryAsync<ItemDefinitionDto>(ItemDefinitionQueries.GetAll);
        }

        public async Task<ItemDefinitionDto?> GetByIdAsync(int id)
        {
            var results = await QueryAsync<ItemDefinitionDto>(
                ItemDefinitionQueries.GetById, 
                new { ItemDefinitionID = id });
            return results.FirstOrDefault();
        }

        public async Task<ItemDefinitionDto> InsertAsync(ItemDefinitionCreateRequest req)
        {
            // Perlu memastikan OrderNo dihitung di FE/Service, dan Category adalah UPPERCASE
            return await QuerySingleAsync<ItemDefinitionDto>(ItemDefinitionCommands.Insert, new
            {
                req.Code,
                req.Label,
                req.Category,
                req.Order,
                req.IsActive,
                req.ValidationSource,
                req.CreatedBy
            });
        }

        public async Task<ItemDefinitionDto> UpdateAsync(
                 ItemDefinitionUpdateRequest req,
                 string category,
                 int orderNo // Menerima data lama dari Service Layer
             )
        {
            DateTime? deletedAt = null;
            string? deletedBy = null;

            if (req.IsDeleted == true)
            {
                deletedAt = DateTime.UtcNow;
                deletedBy = req.UpdatedBy; // Yang mengupdate saat soft delete adalah DeletedBy
                req.IsActive = false; // Memastikan IsActive menjadi false saat soft delete
            }

            return await QuerySingleAsync<ItemDefinitionDto>(ItemDefinitionCommands.Update, new
            {
                req.ItemDefinitionID,
                req.Code,
                req.Label,
                req.IsActive,
                req.ValidationSource,
                req.UpdatedBy,

                Category = category,   // <--- Diambil dari data lama
                OrderNo = orderNo,     // <--- Diambil dari data lama

                DeletedAt = deletedAt,
                DeletedBy = deletedBy
            });
        }

        public async Task UpdateOrderAsync(ItemDefinitionReorderRequest req)
        {
            // Implementasi Table-Valued Parameter (TVP) untuk reorder
            var orderTable = new DataTable();
            orderTable.Columns.Add("ItemDefinitionID", typeof(int));
            orderTable.Columns.Add("OrderNo", typeof(int));

            foreach (var item in req.OrderItems)
            {
                orderTable.Rows.Add(item.ItemDefinitionID, item.OrderNo);
            }

            var parameters = new DynamicParameters();
            parameters.Add("@OrderList", orderTable.AsTableValuedParameter("dbo.ItemDefinitionOrderType")); 
            parameters.Add("@UpdatedBy", req.UpdatedBy);

            await ExecuteAsync(ItemDefinitionCommands.Reorder, parameters);
        }
    }
}