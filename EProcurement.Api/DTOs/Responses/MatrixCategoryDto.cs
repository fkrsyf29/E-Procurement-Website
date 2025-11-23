namespace EProcurement.Api.DTOs.Responses
{
    public class MatrixCategoryDto
    {
        public int CategoryID { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public List<MatrixClassificationDto> Classifications { get; set; } = new();
    }

    public class MatrixClassificationDto
    {
        public int ClassificationID { get; set; }
        public int CategoryID { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public List<MatrixSubClassificationDto> SubClassifications { get; set; } = new();
    }

    public class MatrixSubClassificationDto
    {
        public int SubClassificationID { get; set; }
        public int ClassificationID { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
    }

}
