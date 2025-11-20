using EProcurement.Api.DTOs.Requests;
using EProcurement.Api.DTOs.Responses;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Interfaces;

namespace EProcurement.Api.Services.Implementations
{
    public class JobsiteService : IJobsiteService
    {
        private readonly IJobsiteRepository _repo;

        public JobsiteService(IJobsiteRepository repo)
        {
            _repo = repo;
        }

        public Task<IEnumerable<JobsiteDto>> GetAllAsync() => _repo.GetAllAsync();
    }
}
