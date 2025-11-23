namespace EProcurement.Api.SQL.ItemDefinitions
{
    public static class ItemDefinitionQueries
    {
        // Mengambil semua TOR dan TER sekaligus
        public const string GetAll = @"EXEC SP_ItemDefinition_GetAll";

        public const string GetById = @"EXEC SP_ItemDefinition_GetById @ItemDefinitionID";
    }
}