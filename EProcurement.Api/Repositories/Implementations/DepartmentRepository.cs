using Dapper;
using EProcurement.Api.Data;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Entities;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.SQL.Departments;

namespace EProcurement.Api.Repositories.Implementations
{
    public class DepartmentRepository : DapperRepository, IDepartmentRepository
    {
        public DepartmentRepository(DbConnectionFactory connectionFactory)
            : base(connectionFactory)
        {
        }

        public async Task<IEnumerable<DepartmentDto>> GetAllAsync()
        {
            return await QueryAsync<DepartmentDto>(DepartmentQueries.GetAll);
        }
    }
}
