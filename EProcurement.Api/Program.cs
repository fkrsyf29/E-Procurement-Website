using EProcurement.Api.Config;
using EProcurement.Api.Services.Implementations;
using EProcurement.Api.Services.Interfaces;
using EProcurement.Api.Data;
using EProcurement.Api.Repositories.Interfaces;
using EProcurement.Api.Repositories.Implementations;

var builder = WebApplication.CreateBuilder(args);

// ================================================
// SERVICES
// ================================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===== CORS =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ===== CONFIG =====
builder.Services.Configure<SoapConfig>(builder.Configuration.GetSection("SOAP"));

// ===== CUSTOM SERVICES =====
builder.Services.AddScoped<ISsoService, SsoService>();

// ===== DAPPER FUNDAMENTAL =====
// DbConnectionFactory DI
builder.Services.AddSingleton<DbConnectionFactory>();

// Repository berbasis Dapper
builder.Services.AddScoped<IQueryRepository, DapperRepository>();
builder.Services.AddScoped<ICommandRepository, DapperRepository>();

// ================================================
// APP
// ================================================
var app = builder.Build();

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
app.MapControllers();

// ===== SERVE FRONTEND (Production) =====
app.UseStaticFiles();
app.UseDefaultFiles();
app.MapFallbackToFile("index.html");

app.Run();
