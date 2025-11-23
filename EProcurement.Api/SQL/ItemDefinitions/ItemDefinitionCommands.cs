// EProcurement.Api.SQL.ItemDefinitions/ItemDefinitionCommands.cs
namespace EProcurement.Api.SQL.ItemDefinitions
{
    public static class ItemDefinitionCommands
    {
        public const string Insert = @"EXEC SP_ItemDefinition_Insert
            @Code, @Label, @Category, @Order, @IsActive, @ValidationSource, @CreatedBy";

        public const string Update = @"EXEC SP_ItemDefinition_Update 
            @ItemDefinitionID, @Code, @Label, @IsActive, @ValidationSource, @UpdatedBy, @DeletedAt, @DeletedBy ";

        public const string Delete = @"EXEC SP_ItemDefinition_Delete @ItemDefinitionID"; // Hard Delete

        public const string Reorder = @"EXEC SP_ItemDefinition_Reorder @OrderList, @UpdatedBy";
    }
}
