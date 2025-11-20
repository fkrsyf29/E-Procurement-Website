using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Services.Interfaces
{
    public interface IJobsiteService
    {
        Task<IEnumerable<JobsiteDto>> GetAllAsync();
    }
}
