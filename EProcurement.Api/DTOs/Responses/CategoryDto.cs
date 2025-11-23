namespace EProcurement.Api.DTOs.Responses
{
    public class SubClassificationDto
    {
        public int SubClassificationID { get; set; }
        public int ClassificationID { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
    }

    public class ClassificationDto
    {
        public int ClassificationID { get; set; }
        public int CategoryID { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public List<SubClassificationDto> SubClassifications { get; set; } = new();
    }

    public class CategoryDto
    {
        public int CategoryID { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public List<ClassificationDto> Classifications { get; set; } = new();
    }
}