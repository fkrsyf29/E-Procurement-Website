using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IMatrixCategoryService
    {
        Task<IEnumerable<MatrixCategoryDto >> GetHierarchyAsync();
    }
}
