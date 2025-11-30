namespace EProcurement.Api.Repositories.Interfaces
{
    public interface ISystemDataRepository
    {
        Task<IEnumerable<dynamic>> GetFlatSystemDataAsync();
        Task<bool> CreateAsync(string categoryCode, string code, string name, string description, bool isActive, string user);
        Task<bool> UpdateAsync(string categoryCode, string code, string name, string description, bool isActive, string user);
        Task<bool> DeleteAsync(string categoryCode, string code, string user);
        Task<bool> ReorderAsync(string categoryCode, List<string> orderedIds);
    }
}
