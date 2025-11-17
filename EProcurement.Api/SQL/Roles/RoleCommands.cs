namespace EProcurement.Api.SQL.Roles
{
    public static class UserCommands
    {
        public const string Insert = @"EXEC sp_Role_Insert 
            @Name, @Description, @RoleCategoryID, @ApprovalRoleID, 
            @CanApprove, @CanCreate, @CanView, @IsActive, @IsSystemGenerated,
            @CreatedBy, @PermissionIDs";

        public const string Update = @"EXEC sp_Role_Update 
            @RoleId, @Name, @Description, @RoleCategoryID, @ApprovalRoleID, 
            @CanApprove, @CanCreate, @CanView, @IsActive, @UpdatedBy,
            @IsDeleted, @DeletedBy, @PermissionIDs";
    }
}
