using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IMatrixCategoryRepository
    {
        Task<IEnumerable<MatrixCategoryDto>> GetAllAsync();
    }
}
