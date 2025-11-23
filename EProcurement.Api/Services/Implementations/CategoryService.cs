using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

public class MatrixCategoryService : IMatrixCategoryService
{
    private readonly IMatrixCategoryRepository _repo;

    public MatrixCategoryService(IMatrixCategoryRepository repo)
    {
        _repo = repo;
    }

    public Task<IEnumerable<MatrixCategoryDto>> GetHierarchyAsync()
        => _repo.GetAllAsync();
}
