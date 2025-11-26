namespace EProcurement.Api.DTOs.Responses
{
    public class SystemDataCategoryDto
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<SystemDataItemDto> Items { get; set; } = new List<SystemDataItemDto>();
    }

    public class SystemDataItemDto
    {
        public string Id { get; set; }         // Maps to DB Code
        public string Value { get; set; }      // Maps to DB Name
        public string Abbreviation { get; set; } // Maps to DB Description (Conditional)
        public string Description { get; set; }  // Maps to DB Description (Conditional)
        public bool IsActive { get; set; }
        public int Order { get; set; }         // Maps to DB OrderNo
        public string CreatedAt { get; set; }
        public string UpdatedAt { get; set; }
    }
}
