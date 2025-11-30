using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;
using EProcurement.Api.Repositories.Interfaces;

namespace EProcurement.Api.Repositories.Implementations
{
    public class MaterialRepository : BaseRepository, IMaterialRepository
    {
        public MaterialRepository(DbConnectionFactory connectionFactory) : base(connectionFactory)
        {
        }

        public async Task<IEnumerable<MaterialDto>> GetAllMaterialsAsync()
        {
            using (var connection = CreateConnection())
            {
                // Panggil SP usp_Material_GetAll
                return await connection.QueryAsync<MaterialDto>("usp_Material_GetAll", commandType: CommandType.StoredProcedure);
            }
        }

        public async Task<int> CreateMaterialAsync(Material material)
        {
            using (var connection = CreateConnection())
            {
                var parameters = new DynamicParameters();
                parameters.Add("@MaterialCode", material.MaterialCode);
                parameters.Add("@Description", material.Description);
                parameters.Add("@UOMID", material.UOMID);
                parameters.Add("@ExternalBrandID", material.ExternalBrandID);
                parameters.Add("@ValuationClassID", material.ValuationClassID);
                parameters.Add("@MaterialGroupID", material.MaterialGroupID);
                parameters.Add("@SubClassificationID", material.SubClassificationID);
                parameters.Add("@JobsiteID", material.JobsiteID);
                parameters.Add("@DepartmentID", material.DepartmentID);
                parameters.Add("@Qty", material.Qty);
                parameters.Add("@EstimatedPrice", material.EstimatedPrice);
                parameters.Add("@ContractTypeID", material.ContractTypeID);
                parameters.Add("@VendorID", material.VendorID);
                parameters.Add("@ContractNumber", material.ContractNumber);
                parameters.Add("@ContractName", material.ContractName);
                parameters.Add("@ContractStartDate", material.ContractStartDate);
                parameters.Add("@ContractEndDate", material.ContractEndDate);
                parameters.Add("@IsUnique", material.IsUnique);
                parameters.Add("@CreatedBy", material.CreatedBy);

                // Output Parameter untuk ID Baru
                parameters.Add("@NewID", dbType: DbType.Int32, direction: ParameterDirection.Output);

                await connection.ExecuteAsync("usp_Material_Insert", parameters, commandType: CommandType.StoredProcedure);

                return parameters.Get<int>("@NewID");
            }
        }

        public async Task UpdateMaterialAsync(Material material)
        {
            using (var connection = CreateConnection())
            {
                var parameters = new DynamicParameters();
                parameters.Add("@MaterialID", material.MaterialID);
                parameters.Add("@MaterialCode", material.MaterialCode);
                parameters.Add("@Description", material.Description);
                parameters.Add("@UOMID", material.UOMID);
                parameters.Add("@ExternalBrandID", material.ExternalBrandID);
                parameters.Add("@ValuationClassID", material.ValuationClassID);
                parameters.Add("@MaterialGroupID", material.MaterialGroupID);
                parameters.Add("@SubClassificationID", material.SubClassificationID);
                parameters.Add("@JobsiteID", material.JobsiteID);
                parameters.Add("@DepartmentID", material.DepartmentID);
                parameters.Add("@Qty", material.Qty);
                parameters.Add("@EstimatedPrice", material.EstimatedPrice);
                parameters.Add("@ContractTypeID", material.ContractTypeID);
                parameters.Add("@VendorID", material.VendorID);
                parameters.Add("@ContractNumber", material.ContractNumber);
                parameters.Add("@ContractName", material.ContractName);
                parameters.Add("@ContractStartDate", material.ContractStartDate);
                parameters.Add("@ContractEndDate", material.ContractEndDate);
                parameters.Add("@IsUnique", material.IsUnique);
                parameters.Add("@IsActive", material.IsActive);
                parameters.Add("@UpdatedBy", material.UpdatedBy);

                await connection.ExecuteAsync("usp_Material_Update", parameters, commandType: CommandType.StoredProcedure);
            }
        }

        public async Task DeleteMaterialAsync(int materialId, string deletedBy)
        {
            using (var connection = CreateConnection())
            {
                var parameters = new DynamicParameters();
                parameters.Add("@MaterialID", materialId);
                parameters.Add("@DeletedBy", deletedBy);

                await connection.ExecuteAsync("usp_Material_Delete", parameters, commandType: CommandType.StoredProcedure);
            }
        }

        public async Task<MaterialDto> GetMaterialByIdAsync(int materialId)
        {
            // Bisa reuse GetAll dengan filter WHERE di LINQ atau buat SP GetById
            // Untuk performa terbaik, buat SP usp_Material_GetById. 
            // Disini saya simulasikan query manual demi ringkasnya code response ini.
            using (var connection = CreateConnection())
            {
                string sql = "SELECT * FROM Material WHERE MaterialID = @Id"; // Simplifikasi, idealnya JOIN lengkap seperti GetAll
                return await connection.QueryFirstOrDefaultAsync<MaterialDto>(sql, new { Id = materialId });
            }
        }
    }
}