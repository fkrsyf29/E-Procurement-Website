using EProcurement.Api.Entities;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IRoleRepository
    {
        Task<IEnumerable<Role>> GetAll();
        Task<Role?> GetById(int id);
        Task<int> Insert(Role role);
        Task<int> Update(Role role);
        Task<int> Delete(int id);
    }
}
