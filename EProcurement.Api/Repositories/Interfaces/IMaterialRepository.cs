using System.Collections.Generic;
using System.Threading.Tasks;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IMaterialRepository
    {
        Task<IEnumerable<MaterialDto>> GetAllMaterialsAsync();
        Task<int> CreateMaterialAsync(Material material);
        Task UpdateMaterialAsync(Material material);
        Task DeleteMaterialAsync(int materialId, string deletedBy);
        Task<MaterialDto> GetMaterialByIdAsync(int materialId); // Optional, bagus untuk refresh data setelah save
    }
}