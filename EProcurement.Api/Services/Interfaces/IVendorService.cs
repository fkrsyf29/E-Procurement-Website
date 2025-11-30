using EProcurement.Api.DTOs.Request;
using EProcurement.Api.DTOs.Response;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IVendorService
    {
        Task<IEnumerable<VendorResponseDto>> GetAllVendorsAsync();
        Task SyncVendorsAsync();
        Task UpdateVendorAsync(int id, VendorUpdateRequest request);
    }
}