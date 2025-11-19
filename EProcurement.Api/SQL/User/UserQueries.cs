namespace EProcurement.Api.SQL.Users
{
    public static class UserQueries
    {
        public const string GetAll = @"EXEC sp_User_GetAll";
        public const string GetById = @"EXEC sp_User_GetById @UserId";
        public const string GetByName = @"EXEC sp_User_GetByName @UserName";
    }
}
