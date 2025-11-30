using System.Collections.Generic;
using System.Threading.Tasks;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class MaterialService : IMaterialService
    {
        private readonly IMaterialRepository _repository;

        public MaterialService(IMaterialRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<MaterialDto>> GetAllMaterialsAsync()
        {
            return await _repository.GetAllMaterialsAsync();
        }

        public async Task<MaterialDto> CreateMaterialAsync(MaterialCreateRequest request)
        {
            var entity = new Material
            {
                MaterialCode = request.MaterialCode,
                Description = request.Description,
                UOMID = request.UOMID,
                ExternalBrandID = request.ExternalBrandID,
                ValuationClassID = request.ValuationClassID,
                MaterialGroupID = request.MaterialGroupID,
                SubClassificationID = request.SubClassificationID,
                JobsiteID = request.JobsiteID,
                DepartmentID = request.DepartmentID,
                Qty = request.Qty,
                EstimatedPrice = request.EstimatedPrice,
                ContractTypeID = request.ContractTypeID,
                VendorID = request.VendorID,
                ContractNumber = request.ContractNumber,
                ContractName = request.ContractName,
                ContractStartDate = request.ContractStartDate,
                ContractEndDate = request.ContractEndDate,
                IsUnique = request.IsUnique,
                CreatedBy = request.CreatedBy
            };

            var newId = await _repository.CreateMaterialAsync(entity);

            // Return DTO sederhana atau fetch full data
            return new MaterialDto { MaterialID = newId, MaterialCode = request.MaterialCode };
        }

        public async Task<MaterialDto> UpdateMaterialAsync(MaterialUpdateRequest request)
        {
            if (request.IsDeleted)
            {
                await _repository.DeleteMaterialAsync(request.MaterialID, request.DeletedBy);
                return null;
            }

            var entity = new Material
            {
                MaterialID = request.MaterialID,
                MaterialCode = request.MaterialCode,
                Description = request.Description,
                UOMID = request.UOMID,
                ExternalBrandID = request.ExternalBrandID,
                ValuationClassID = request.ValuationClassID,
                MaterialGroupID = request.MaterialGroupID,
                SubClassificationID = request.SubClassificationID,
                JobsiteID = request.JobsiteID,
                DepartmentID = request.DepartmentID,
                Qty = request.Qty,
                EstimatedPrice = request.EstimatedPrice,
                ContractTypeID = request.ContractTypeID,
                VendorID = request.VendorID,
                ContractNumber = request.ContractNumber,
                ContractName = request.ContractName,
                ContractStartDate = request.ContractStartDate,
                ContractEndDate = request.ContractEndDate,
                IsUnique = request.IsUnique,
                IsActive = request.IsActive,
                UpdatedBy = request.UpdatedBy
            };

            await _repository.UpdateMaterialAsync(entity);
            return new MaterialDto { MaterialID = request.MaterialID };
        }

        public async Task DeleteMaterialAsync(int id, string user)
        {
            await _repository.DeleteMaterialAsync(id, user);
        }
    }
}