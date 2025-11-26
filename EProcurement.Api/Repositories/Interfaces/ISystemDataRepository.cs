namespace EProcurement.Api.Repositories.Interfaces
{
    public interface ISystemDataRepository
    {
        Task<IEnumerable<dynamic>> GetFlatSystemDataAsync();
        Task<bool> CreateAsync(string categoryCode, string code, string name, string description, bool isActive);
        Task<bool> UpdateAsync(string categoryCode, string code, string name, string description, bool isActive);
        Task<bool> DeleteAsync(string categoryCode, string code);
        Task<bool> ReorderAsync(string categoryCode, List<string> orderedIds);
    }
}
