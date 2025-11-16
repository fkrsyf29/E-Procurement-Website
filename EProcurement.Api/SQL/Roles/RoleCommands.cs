namespace EProcurement.Api.SQL.Roles
{
    public static class RoleCommands
    {
        public const string Insert = @"
            INSERT INTO roles
            (
                name,
                description,
                permissions,
                canApprove,
                canCreate,
                canView,
                category,
                isActive,
                isSystemGenerated,
                createdDate
            )
            VALUES
            (
                @name,
                @description,
                @permissions,
                @canApprove,
                @canCreate,
                @canView,
                @category,
                @isActive,
                @isSystemGenerated,
                GETDATE()
            );

            SELECT SCOPE_IDENTITY();
        ";

        public const string Update = @"
            UPDATE roles SET
                name = @name,
                description = @description,
                permissions = @permissions,
                canApprove = @canApprove,
                canCreate = @canCreate,
                canView = @canView,
                category = @category,
                isActive = @isActive
            WHERE id = @id;
        ";

        public const string Delete = @"
            DELETE FROM roles WHERE id = @id;
        ";
    }
}
