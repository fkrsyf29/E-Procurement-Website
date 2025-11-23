using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.Region;

namespace EProcurement.Api.Repositories.Implementations
{
    public class RegionRepository : DapperRepository, IRegionRepository
    {
        public RegionRepository(DbConnectionFactory connectionFactory)
            : base(connectionFactory)
        {
        }

        public async Task<IEnumerable<RegionDto>> GetAllAsync()
        {
            return await QueryAsync<RegionDto>(RegionQueries.GetAll);
        }
    }
}
