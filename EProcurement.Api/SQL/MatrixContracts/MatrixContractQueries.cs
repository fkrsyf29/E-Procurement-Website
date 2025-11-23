namespace EProcurement.Api.SQL.MatrixContracts
{
    public static class MatrixContractQueries
    {
        public const string GetAll = @"EXEC SP_MatrixContract_GetAll";
        public const string GetById = @"EXEC SP_MatrixContract_GetById @MatrixContractID";
    }
}