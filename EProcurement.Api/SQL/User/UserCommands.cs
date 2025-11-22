namespace EProcurement.Api.SQL.Users
{
    public static class UserCommands
    {
        public const string Insert = @"EXEC sp_User_Insert 
            @Username, @Name, @RoleID, @JobsiteID, 
            @DepartmentID, @Email, @Phone, @CreatedBy";

        public const string Update = @"EXEC sp_User_Update 
            @UserID, @Username, @Name, @RoleID, 
            @JobsiteID, @DepartmentID, @Email, @Phone, @IsActive,
            @UpdatedBy, @IsDeleted, @DeletedBy";

        public const string SetRefreshToken = @"EXEC sp_User_SetRefreshToken
            @UserId, @RefreshToken, @ExpiryDate";

        public const string GetByRefreshToken = @"EXEC sp_User_ValidateAndGetByRefreshToken @RefreshToken";
    }
}
