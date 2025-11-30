using EProcurement.Api.DTOs.Response;
using EProcurement.Api.DTOs.Request;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IVendorRepository
    {
        Task<IEnumerable<VendorResponseDto>> GetAllVendorsAsync();
        Task SyncVendorsAsync();
        Task UpdateVendorAsync(int id, VendorUpdateRequest request);
    }
}