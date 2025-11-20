using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.Jobsite;

namespace EProcurement.Api.Repositories.Implementations
{
    public class JobsiteRepository : DapperRepository, IJobsiteRepository
    {
        public JobsiteRepository(DbConnectionFactory connectionFactory)
            : base(connectionFactory)
        {
        }

        public async Task<IEnumerable<JobsiteDto>> GetAllAsync()
        {
            return await QueryAsync<JobsiteDto>(JobsiteQueries.GetAll);
        }
    }
}
