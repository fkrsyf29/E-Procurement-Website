using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;

namespace EProcurement.Api.Repositories.Interfaces
{
    public interface IJobsiteRepository
    {
        Task<IEnumerable<JobsiteDto>> GetAllAsync();
    }
}
