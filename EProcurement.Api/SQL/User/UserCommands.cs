namespace EProcurement.Api.SQL.Users
{
    public static class UserCommands
    {
        public const string Insert = @"EXEC sp_User_Insert 
            @Username, @PasswordHash, @Name, @RoleID, @JobsiteID, 
            @DepartmentID, @Email, @Phone, @CreatedBy";

        public const string Update = @"EXEC sp_User_Update 
            @UserID, @Username, @PasswordHash, @Name, @RoleID, 
            @JobsiteID, @DepartmentID, @Email, @Phone, @IsActive,
            @UpdatedBy, @IsDeleted, @DeletedBy";
    }
}
