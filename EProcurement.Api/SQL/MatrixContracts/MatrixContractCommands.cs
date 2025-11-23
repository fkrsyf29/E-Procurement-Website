// EProcurement.Api.SQL.MatrixContracts/MatrixContractCommands.cs
namespace EProcurement.Api.SQL.MatrixContracts
{
    public static class MatrixContractCommands
    {
        public const string Insert = @"EXEC SP_MatrixContract_Insert
            @Code, @Label, @Description, @OrderNo, @IsActive, @CreatedBy";

        public const string Update = @"EXEC SP_MatrixContract_Update 
            @MatrixContractID, @Code, @Label, @Description, @OrderNo, @IsActive, 
            @UpdatedBy, @DeletedAt, @DeletedBy"; // Note: DeletedAt/DeletedBy harus dihitung di Service/Repository

        public const string Reorder = @"EXEC SP_MatrixContract_Reorder @OrderList, @UpdatedBy";
        // Note: Implementasi Dapper TVP membutuhkan penanganan khusus di Repository.
    }
}

