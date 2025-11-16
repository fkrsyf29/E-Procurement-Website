using EProcurement.Api.Entities;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IRoleService
    {
        Task<IEnumerable<Role>> GetAll();
        Task<Role?> GetById(int id);
        Task<int> Create(Role model);
        Task<int> Update(Role model);
        Task<int> Delete(int id);
    }
}
