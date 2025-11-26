using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Services.Interfaces;
using EProcurement.Api.Repositories.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class SystemDataService : ISystemDataService
    {
        private readonly ISystemDataRepository _repository;

        public SystemDataService(ISystemDataRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<SystemDataCategoryDto>> GetAllSystemDataAsync()
        {
            var flatData = await _repository.GetFlatSystemDataAsync();

            var groupedData = flatData
                // 1. Lakukan Casting (string)/(int) di sini agar Key tidak dynamic
                .GroupBy(x => new
                {
                    CategoryCode = (string)x.CategoryCode,
                    CategoryName = (string)x.CategoryName,
                    CategoryDesc = (string)x.CategoryDesc,
                    CategoryOrder = (int)x.CategoryOrder
                })
                .OrderBy(g => g.Key.CategoryOrder)
                .Select(g => new SystemDataCategoryDto
                {
                    Code = g.Key.CategoryCode,
                    Name = g.Key.CategoryName,
                    Description = g.Key.CategoryDesc,
                    Items = g.Select(item => MapToDto(g.Key.CategoryCode, item))
                         .Cast<SystemDataItemDto>() // Paksa casting ke tipe DTO
                         .ToList()
                })
                .ToList();

            return groupedData;
        }

        public async Task<SystemDataItemDto> CreateItemAsync(string categoryCode, CreateSystemDataItemRequest request)
        {
            string newCode;

            // LOGIC BARU: Penentuan Code (ID)
            if (categoryCode == "jobsite" || categoryCode == "department")
            {
                // Untuk Jobsite & Dept, Code diambil dari input Abbreviation user (contoh: "40AB", "PLANT")
                if (string.IsNullOrWhiteSpace(request.Abbreviation))
                {
                    throw new ArgumentException("Abbreviation is required for this category to be used as Code.");
                }
                newCode = request.Abbreviation.ToUpper().Trim();
            }
            else
            {
                // Untuk yang lain, auto-generate ID (contoh: "kbli-638218...", "uom-123...")
                newCode = $"{GetPrefix(categoryCode)}-{DateTime.Now.Ticks.ToString().Substring(10)}";
            }

            // Logic Description Database
            // Jobsite/Dept tidak butuh simpan desc di kolom Description lagi karena Code sudah mewakili Abbreviation.
            // KBLI & MaterialGroup butuh kolom Description.
            string dbDescription = ResolveDbDescription(categoryCode, request.Description);

            var newItem = new SystemDataItemDto
            {
                Id = newCode,
                Value = request.Value,
                IsActive = true,
                // Mapping balik properti DTO sesuai logic baru
                Abbreviation = (categoryCode == "jobsite" || categoryCode == "department") ? newCode : request.Abbreviation,
                Description = request.Description,
                CreatedAt = DateTime.Now.ToString("yyyy-MM-dd"),
                UpdatedAt = DateTime.Now.ToString("yyyy-MM-dd")
            };

            // Simpan ke Repository
            var success = await _repository.CreateAsync(categoryCode, newCode, request.Value, dbDescription, true);
            return success ? newItem : null;
        }

        public async Task<bool> UpdateItemAsync(string categoryCode, string id, UpdateSystemDataItemRequest request)
        {
            // Catatan: Update biasanya tidak mengubah Primary Key (Code).
            // Jadi jika user mengedit Abbreviation Jobsite di FE, logic ini hanya mengupdate Name/Description/Active.
            // Jika User ingin ganti Kode Jobsite (misal 40AB -> 40AC), idealnya hapus dan buat baru, atau butuh logic khusus.

            string dbDescription = ResolveDbDescription(categoryCode, request.Description);
            return await _repository.UpdateAsync(categoryCode, id, request.Value, dbDescription, request.IsActive);
        }

        public async Task<bool> DeleteItemAsync(string categoryCode, string id)
        {
            return await _repository.DeleteAsync(categoryCode, id);
        }

        public async Task<bool> ReorderItemsAsync(string categoryCode, List<string> itemIds)
        {
            return await _repository.ReorderAsync(categoryCode, itemIds);
        }

        // --- Helpers ---

        private string GetPrefix(string categoryCode)
        {
            return categoryCode switch
            {
                "contractType" => "ct",
                "contractualType" => "cst",
                "materialGroup" => "mg",
                "kbli" => "kbli",
                "uom" => "uom",
                "fundingSource" => "fs",
                "externalBrand" => "brand",
                "valuationClass" => "vc",
                _ => "item"
            };
        }

        private string ResolveDbDescription(string category, string desc)
        {
            // Hanya KBLI dan Material Group yang menggunakan kolom Description di DB
            if (category == "materialGroup" || category == "kbli") return desc;

            // Jobsite & Department sekarang menyimpan infonya di kolom Code (Primary Key), 
            // jadi Description di DB bisa dikosongkan (NULL).
            return null;
        }

        private SystemDataItemDto MapToDto(string categoryCode, dynamic dbItem)
        {
            var dto = new SystemDataItemDto
            {
                Id = dbItem.ItemCode,     // Selalu Code dari DB
                Value = dbItem.ItemName,  // Selalu Name dari DB
                IsActive = dbItem.IsActive,
                Order = Convert.ToInt32(dbItem.OrderNo),
                CreatedAt = "2025-01-01",
                UpdatedAt = "2025-11-07"
            };

            // KOREKSI UTAMA DISINI
            if (categoryCode == "jobsite" || categoryCode == "department")
            {
                // Abbreviation diambil langsung dari Code (misal: '40AB', 'PLANT')
                dto.Abbreviation = dbItem.ItemCode;
                dto.Description = null;
            }
            else if (categoryCode == "materialGroup" || categoryCode == "kbli")
            {
                // KBLI/MatGroup mengambil Description dari kolom Description DB
                dto.Description = dbItem.ItemDesc;
                dto.Abbreviation = null;
            }
            // Category lain (UOM, Funding, dll) tidak pakai Abbr/Desc tambahan

            return dto;
        }
    }
}
