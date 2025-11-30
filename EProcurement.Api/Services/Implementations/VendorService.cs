using EProcurement.Api.DTOs.Request;
using EProcurement.Api.DTOs.Response;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class VendorService : IVendorService
    {
        private readonly IVendorRepository _repository;

        public VendorService(IVendorRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<VendorResponseDto>> GetAllVendorsAsync()
        {
            return await _repository.GetAllVendorsAsync();
        }

        public async Task SyncVendorsAsync()
        {
            await _repository.SyncVendorsAsync();
        }

        public async Task UpdateVendorAsync(int id, VendorUpdateRequest request)
        {
            // Business Logic Validation (Optional)
            if (request.Rating > 5 || request.Rating < 0)
            {
                throw new ArgumentException("Rating must be between 0 and 5");
            }

            await _repository.UpdateVendorAsync(id, request);
        }
    }
}