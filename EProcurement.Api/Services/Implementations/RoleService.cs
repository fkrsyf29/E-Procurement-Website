using EProcurement.Api.Entities;
using EProcurement.Api.Repositories.Implementations;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class RoleService : IRoleService
    {
        private readonly RoleRepository _repo;

        public RoleService(RoleRepository repo)
        {
            _repo = repo;
        }

        public Task<IEnumerable<Role>> GetAll()
            => _repo.GetAll();

        public Task<Role?> GetById(int id)
            => _repo.GetById(id);

        public async Task<int> Create(Role model)
        {
            model.Created_At = DateTime.Now;
            return await _repo.Insert(model);
        }

        public Task<int> Update(Role model)
            => _repo.Update(model);

        public Task<int> Delete(int id)
            => _repo.Delete(id);
    }
}
