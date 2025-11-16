using System.Threading.Tasks;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IQueryRepository
    {
        Task<T?> QuerySingleAsync<T>(string sql, object? param = null);
        Task<IEnumerable<T>> QueryAsync<T>(string sql, object? param = null);
    }
}
