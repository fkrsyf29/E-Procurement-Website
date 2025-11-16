namespace EProcurement.Api.SQL.Roles
{
    public static class RoleQueries
    {
        public const string GetAll = @"
            SELECT 
                id,
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
            FROM roles
            ORDER BY createdDate DESC;
        ";

        public const string GetById = @"
            SELECT 
                id,
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
            FROM roles
            WHERE id = @id;
        ";
    }
}
