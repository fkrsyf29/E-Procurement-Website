namespace EProcurement.Api.SQL.ApprovalMatrix
{
    public static class ApprovalMatrixCommands
    {
        // Memanggil SP yang mengembalikan 2 Result Set (Header & Details)
        public const string GetAll = @"EXEC SP_ApprovalMatrix_GetAll";

        // Memanggil SP Save (Insert/Update) dengan TVP
        public const string Save = @"EXEC SP_ApprovalMatrix_Save 
            @MatrixID, @DepartmentID, @JobsiteID, @AmountMin, @AmountMax, 
            @GroupName, @IsActive, @User, @Steps";

        // Soft Delete
        public const string Delete = @"EXEC SP_ApprovalMatrix_Delete @MatrixID, @User";
    }
}