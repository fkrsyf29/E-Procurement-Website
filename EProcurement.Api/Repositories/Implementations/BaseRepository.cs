using System.Data;
using EProcurement.Api.Data;
using EProcurement.Api.Repositories.Interfaces;

namespace EProcurement.Api.Repositories.Implementations
{
    public abstract class BaseRepository : IBaseRepository
    {
        private readonly DbConnectionFactory _factory;

        protected BaseRepository(DbConnectionFactory factory)
        {
            _factory = factory;
        }

        public IDbConnection CreateConnection() => _factory.CreateConnection();
    }

}
