namespace EProcurement.Api.SQL.CategoryManagement
{
    public static class CategoryManagementQueries
    {
        public const string GetAllHierarchy = @"EXEC SP_Category_GetAllHierarchy";
    }
}