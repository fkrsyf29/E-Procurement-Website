using EProcurement.Api.Models.Config;
using EProcurement.Api.Services.Implementations;
using EProcurement.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

builder.Services.Configure<SoapConfig>(builder.Configuration.GetSection("SOAP"));
builder.Services.AddScoped<ISsoService, SsoService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
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

// === SERVE FRONTEND (Production) ===
app.UseStaticFiles();
app.UseDefaultFiles();
app.MapFallbackToFile("index.html"); // SPA routing

app.Run();
