using System.Data;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IBaseRepository
    {
        IDbConnection CreateConnection();
    }
}
