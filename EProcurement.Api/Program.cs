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
// DEPENDENCY INJECTION — SERVICES (Business Logic)
// ================================================
builder.Services.AddScoped<ISsoService, SsoService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IJobsiteService, JobsiteService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IApprovalRoleService, ApprovalRoleService>();
builder.Services.AddScoped<IPermissionCategoryService, PermissionCategoryService>();
builder.Services.AddScoped<IRoleCategoryService, RoleCategoryService>();
builder.Services.AddScoped<IUserService, UserService>();

// ================================================
// DAPPER FUNDAMENTALS
// ================================================

// Connection Factory
builder.Services.AddSingleton<DbConnectionFactory>();

// Repository Specific
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IJobsiteRepository, JobsiteRepository>();
builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();
builder.Services.AddScoped<IPermissionCategoryRepository, PermissionCategoryRepository>();
builder.Services.AddScoped<IRoleCategoryRepository, RoleCategoryRepository>();
builder.Services.AddScoped<IApprovalRoleRepository, ApprovalRoleRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Base Dapper Repositories (Generic)
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

// Security Middleware
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
