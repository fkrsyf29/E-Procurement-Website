using EProcurement.Api.Authentication;
using EProcurement.Api.Config;
using EProcurement.Api.Data;
using EProcurement.Api.Data.TypeHandlers;
using EProcurement.Api.Repositories.Implementations;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Services.Implementations;
using EProcurement.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// ================================================
// CORE ASP.NET SERVICES
// ================================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ================================================
// CORS
// ================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy.WithOrigins("https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ================================================
// CONFIG (AppSettings / SOAP / dll)
// ================================================
builder.Services.Configure<SoapConfig>(builder.Configuration.GetSection("SOAP"));
builder.Services.AddJwtAuthentication(builder.Configuration);

// ================================================
// DEPENDENCY INJECTION — REPOSITORIES & SERVICES
// ================================================

// ---- Approval Matrix
builder.Services.AddScoped<IApprovalMatrixRepository, ApprovalMatrixRepository>();
builder.Services.AddScoped<IApprovalMatrixService, ApprovalMatrixService>();

// ---- Approval Role
builder.Services.AddScoped<IApprovalRoleRepository, ApprovalRoleRepository>();
builder.Services.AddScoped<IApprovalRoleService, ApprovalRoleService>();

// ---- Category Management
builder.Services.AddScoped<ICategoryManagementRepository, CategoryManagementRepository>();
builder.Services.AddScoped<ICategoryManagementService, CategoryManagementService>();

// ---- Department
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();

// ---- Item Definition
builder.Services.AddScoped<IItemDefinitionRepository, ItemDefinitionRepository>();
builder.Services.AddScoped<IItemDefinitionService, ItemDefinitionService>();

// ---- Jobsite
builder.Services.AddScoped<IJobsiteRepository, JobsiteRepository>();
builder.Services.AddScoped<IJobsiteService, JobsiteService>();

// ---- Matrix
builder.Services.AddScoped<ITorTerMatrixRepository, TorTerMatrixRepository>();
builder.Services.AddScoped<ITorTerMatrixService, TorTerMatrixService>();

// ---- Matrix Category
builder.Services.AddScoped<IMatrixCategoryRepository, MatrixCategoryRepository>();
builder.Services.AddScoped<IMatrixCategoryService, MatrixCategoryService>();

// ---- Matrix Contract
builder.Services.AddScoped<IMatrixContractRepository, MatrixContractRepository>();
builder.Services.AddScoped<IMatrixContractService, MatrixContractService>();

// ---- Permission
builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();
builder.Services.AddScoped<IPermissionService, PermissionService>();

// ---- Permission Category
builder.Services.AddScoped<IPermissionCategoryRepository, PermissionCategoryRepository>();
builder.Services.AddScoped<IPermissionCategoryService, PermissionCategoryService>();

// ---- Region
builder.Services.AddScoped<IRegionRepository, RegionRepository>();
builder.Services.AddScoped<IRegionService, RegionService>();

// ---- Role
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IRoleService, RoleService>();

// ---- Role Category
builder.Services.AddScoped<IRoleCategoryRepository, RoleCategoryRepository>();
builder.Services.AddScoped<IRoleCategoryService, RoleCategoryService>();


// ---- SSO
builder.Services.AddScoped<ISsoService, SsoService>();

// ---- User
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddScoped<ISystemDataRepository, SystemDataRepository>();
builder.Services.AddScoped<ISystemDataService, SystemDataService>();

// ================================================
// DAPPER FUNDAMENTALS
// ================================================

// Connection Factory
builder.Services.AddSingleton<DbConnectionFactory>();

// Generic Dapper Repositories
builder.Services.AddScoped<IQueryRepository, DapperRepository>();
builder.Services.AddScoped<ICommandRepository, DapperRepository>();

// ================================================
// REGISTER TYPE HANDLERS (DAPPER)
// ================================================
Dapper.SqlMapper.AddTypeHandler(new CsvToIntListHandler());
Dapper.SqlMapper.AddTypeHandler(new CsvToStringListHandler());

// ================================================
// BUILD APP
// ================================================
var app = builder.Build();

// ================================================
// MIDDLEWARE PIPELINE
// ================================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("DevCors");
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseAuthorization();

// ================================================
// ROUTES
// ================================================
app.MapControllers();

// ================================================
// STATIC FILES — SERVE REACT FRONTEND (Production)
// ================================================
app.UseStaticFiles();
app.UseDefaultFiles();
app.MapFallbackToFile("index.html");

// ================================================
// RUN
// ================================================
app.Run();
