namespace EProcurement.Api.SQL.CategoryManagement
{
    public static class CategoryManagementCommands
    {
        public const string CreateCategory = @"EXEC SP_Category_Insert @Code, @Name, @IsActive, @User";
        public const string UpdateCategory = @"EXEC SP_Category_Update @CategoryID, @Code, @Name, @IsActive, @User, @DeletedAt, @DeletedBy";

        public const string CreateClassification = @"EXEC SP_Classification_Insert @CategoryID, @Code, @Name, @IsActive, @User";
        public const string UpdateClassification = @"EXEC SP_Classification_Update @ClassificationID, @CategoryID, @Code, @Name, @IsActive, @User, @DeletedAt, @DeletedBy";

        public const string CreateSubClassification = @"EXEC SP_SubClassification_Insert @ClassificationID, @Code, @Name, @IsActive, @User";
        public const string UpdateSubClassification = @"EXEC SP_SubClassification_Update @SubClassificationID, @ClassificationID, @Code, @Name, @IsActive, @UpdatedBy, @DeletedAt, @DeletedBy";
    }
}