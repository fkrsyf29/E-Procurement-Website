namespace EProcurement.Api.DTOs.Requests
{
    public class CreateSystemDataItemRequest
    {
        public string Value { get; set; }
        public string? Abbreviation { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateSystemDataItemRequest
    {
        public string Value { get; set; }
        public string? Abbreviation { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class ReorderSystemDataRequest
    {
        public List<string> ItemIds { get; set; } // List of IDs in new order
    }
}
