using System.Collections.Generic;
using System.Threading.Tasks;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IMaterialService
    {
        Task<IEnumerable<MaterialDto>> GetAllMaterialsAsync();
        Task<MaterialDto> CreateMaterialAsync(MaterialCreateRequest request);
        Task<MaterialDto> UpdateMaterialAsync(MaterialUpdateRequest request);
        Task DeleteMaterialAsync(int id, string user);
    }
}