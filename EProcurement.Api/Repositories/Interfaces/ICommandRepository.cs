using System.Threading.Tasks;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface ICommandRepository
    {
        Task<int> ExecuteAsync(string sql, object? param = null);
    }
}
