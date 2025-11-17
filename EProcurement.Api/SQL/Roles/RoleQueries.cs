namespace EProcurement.Api.SQL.Roles
{
    public static class UserQueries
    {
        public const string GetAll = @"EXEC sp_Role_GetAll";
        public const string GetById = @"EXEC sp_Role_GetById @RoleId";
    }
}
