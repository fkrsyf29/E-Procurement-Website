using EProcurement.Api.Entities;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IDepartmentService
    {
        Task<IEnumerable<Department>> GetAllAsync();
    }
}
