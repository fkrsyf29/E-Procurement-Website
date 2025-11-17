using EProcurement.Api.Entities;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IDepartmentRepository
    {
        Task<IEnumerable<Department>> GetAllAsync();
    }
}
