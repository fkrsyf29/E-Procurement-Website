using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Request;
using EProcurement.Api.DTOs.Response;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.Vendor;
using System.Data;
using System.Text.Json;

namespace EProcurement.Api.Repositories.Implementations
{
    public class VendorRepository : IVendorRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public VendorRepository(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // Helper untuk membuat koneksi
        private IDbConnection CreateConnection()
        {
            return _connectionFactory.CreateConnection();
        }

        public async Task<IEnumerable<VendorResponseDto>> GetAllVendorsAsync()
        {
            // Execute SP
            using var db = CreateConnection();
            var rawData = await db.QueryAsync<VendorRawSqlResult>(
                VendorQueries.GetVendors,
                commandType: CommandType.StoredProcedure
            );

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            // Mapping Raw SQL (JSON String) to Object
            var result = rawData.Select(row =>
            {
                var dto = new VendorResponseDto
                {
                    VendorId = row.VendorId,
                    ExternalVendorId = row.ExternalVendorId,
                    VendorCode = row.VendorCode,
                    VendorName = row.VendorName,
                    ContactPerson = row.ContactPerson,
                    PhoneNumber = row.PhoneNumber,
                    Email = row.Email,
                    Address = row.Address,
                    Website = row.Website,
                    Rating = row.Rating,
                    IsActive = row.IsActive,
                    IsPreferred = row.IsPreferred,
                    CompanySize = row.CompanySize,
                    YearEstablished = row.YearEstablished,
                    Npwp = row.Npwp,
                    Siup = row.Siup,
                    CreditLimit = row.CreditLimit,
                    PaymentTerms = row.PaymentTerms,
                    Notes = row.Notes,
                    CreatedAt = row.CreatedAt,
                    UpdatedAt = row.UpdatedAt
                };

                // MANUAL DESERIALIZATION (String JSON -> C# Object)
                // Karena SP mengembalikan JSON String via FOR JSON PATH
                if (!string.IsNullOrEmpty(row.CapabilitiesSubClassifications))
                {
                    dto.Capabilities.SubClassifications = JsonSerializer.Deserialize<List<SubClassificationDto>>(
                        row.CapabilitiesSubClassifications,
                        jsonOptions // <--- PENTING!
                    ) ?? new();
                }

                if (!string.IsNullOrEmpty(row.CapabilitiesKbliCodes))
                {
                    dto.Capabilities.KbliCodes = JsonSerializer.Deserialize<List<KbliDto>>(
                        row.CapabilitiesKbliCodes,
                        jsonOptions // <--- PENTING!
                    ) ?? new();
                }

                if (!string.IsNullOrEmpty(row.CapabilitiesBrands))
                {
                    dto.Capabilities.Brands = JsonSerializer.Deserialize<List<BrandDto>>(
                        row.CapabilitiesBrands,
                        jsonOptions // <--- PENTING!
                    ) ?? new();
                }

                return dto;
            });

            return result;
        }

        public async Task SyncVendorsAsync()
        {
            using var db = CreateConnection();
            await db.ExecuteAsync(
                VendorCommands.SyncFromExternal,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task UpdateVendorAsync(int id, VendorUpdateRequest request)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@Id", id);

            // Enrichment Params
            parameters.Add("@ContactPerson", request.ContactPerson);
            parameters.Add("@ContactEmail", request.ContactEmail);
            parameters.Add("@ContactPhone", request.ContactPhone);
            parameters.Add("@Rating", request.Rating);
            parameters.Add("@IsActive", request.IsActive);
            parameters.Add("@IsPreferred", request.IsPreferred);
            parameters.Add("@CompanySize", request.CompanySize);
            parameters.Add("@YearEstablished", request.YearEstablished);
            parameters.Add("@Siup", request.Siup);
            parameters.Add("@CreditLimit", request.CreditLimit);
            parameters.Add("@PaymentTerms", request.PaymentTerms);
            parameters.Add("@Notes", request.Notes);
            parameters.Add("@UpdatedBy", request.UpdatedBy);

            // JSON Params (Serialize List -> JSON String)
            string subClassJson = request.SubClassificationIds?.Any() == true
                ? JsonSerializer.Serialize(request.SubClassificationIds) : null;

            string kbliJson = request.KbliIds?.Any() == true
                ? JsonSerializer.Serialize(request.KbliIds) : null;

            string brandsJson = request.BrandIds?.Any() == true
                ? JsonSerializer.Serialize(request.BrandIds) : null;

            parameters.Add("@SubClassJson", subClassJson);
            parameters.Add("@KbliJson", kbliJson);
            parameters.Add("@BrandsJson", brandsJson);

            using var db = CreateConnection();
            await db.ExecuteAsync(
                VendorCommands.UpdateVendor,
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }

        // Internal Class untuk Mapping Hasil SQL yang mengandung kolom JSON String
        private class VendorRawSqlResult
        {
            public int VendorId { get; set; }
            public string ExternalVendorId { get; set; }
            public string VendorCode { get; set; }
            public string VendorName { get; set; }
            public string ContactPerson { get; set; }
            public string PhoneNumber { get; set; }
            public string Email { get; set; }
            public string Address { get; set; }
            public string Website { get; set; }
            public decimal? Rating { get; set; }
            public bool IsActive { get; set; }
            public bool IsPreferred { get; set; }
            public string CompanySize { get; set; }
            public int? YearEstablished { get; set; }
            public string Npwp { get; set; }
            public string Siup { get; set; }
            public decimal? CreditLimit { get; set; }
            public string PaymentTerms { get; set; }
            public string Notes { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime UpdatedAt { get; set; }

            // Kolom ini dari SQL adalah String (JSON), perlu di-mapping manual
            // Nama properti harus COCOK dengan 'AS [alias]' di SQL Query
            public string CapabilitiesSubClassifications { get; set; }
            public string CapabilitiesKbliCodes { get; set; }
            public string CapabilitiesBrands { get; set; }
        }
    }
}