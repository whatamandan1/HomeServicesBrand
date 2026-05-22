using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Sorted.Core.Options;
using CorsOptions = Sorted.Core.Options.CorsOptions;
using Sorted.Infrastructure;
using Sorted.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var localSettings = Path.Combine(builder.Environment.ContentRootPath, "appsettings.Development.local.json");
builder.Configuration.AddJsonFile(localSettings, optional: true, reloadOnChange: true);

builder.Host.UseSerilog((ctx, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console());

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Sorted API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var jwt = builder.Configuration.GetSection(JwtOptions.Section).Get<JwtOptions>() ?? new JwtOptions();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Secret))
        };
    });
builder.Services.AddAuthorization();

var corsOrigins = builder.Configuration.GetSection(CorsOptions.Section).Get<CorsOptions>()?.AllowedOrigins
    ?? ["http://localhost:3000"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddSortedInfrastructure(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health/live", () => Results.Ok(new { status = "ok" }));
app.MapGet("/health", async (SortedDbContext db, IConfiguration config) =>
{
    var cs = DatabaseConfiguration.ResolveConnectionString(config);
    var canConnect = false;
    string? dbError = null;
    try
    {
        canConnect = await db.Database.CanConnectAsync();
    }
    catch (Exception ex)
    {
        dbError = ex.Message;
    }

    return Results.Ok(new
    {
        status = "ok",
        database = DatabaseConfiguration.IsPostgres(cs) ? "postgresql" : "sqlite",
        databaseSource = DatabaseConfiguration.DescribeSource(config),
        canConnect,
        dbError,
    });
});
app.MapControllers();

var startupLogger = app.Services.GetRequiredService<ILogger<Program>>();
var dbConnection = DatabaseConfiguration.ResolveConnectionString(app.Configuration);
var dbKind = DatabaseConfiguration.IsPostgres(dbConnection) ? "PostgreSQL" : "SQLite";
var dbSource = DatabaseConfiguration.DescribeSource(app.Configuration);
var stripeConfigured = !string.IsNullOrWhiteSpace(app.Configuration["Stripe:SecretKey"]);
var webhookConfigured = !string.IsNullOrWhiteSpace(app.Configuration["Stripe:WebhookSecret"]);
var sendGridConfigured = !string.IsNullOrWhiteSpace(app.Configuration["SendGrid:ApiKey"]);
var openAiConfigured = !string.IsNullOrWhiteSpace(app.Configuration["OpenAI:ApiKey"]);
startupLogger.LogInformation(
    "Sorted API starting — DB config: {Database} ({Source}) | Stripe: {StripeKey} | Webhook: {Webhook} | SendGrid: {SendGrid} | OpenAI: {OpenAi}",
    dbKind,
    dbSource,
    stripeConfigured ? "ok" : "missing",
    webhookConfigured ? "ok" : "missing",
    sendGridConfigured ? "ok" : "missing",
    openAiConfigured ? "ok" : "missing");

_ = InitializeDatabaseAsync(app.Services, startupLogger);

app.Run();

static async Task InitializeDatabaseAsync(IServiceProvider services, ILogger<Program> logger)
{
    try
    {
        await Task.Delay(250);
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SortedDbContext>();
        await db.Database.EnsureCreatedAsync();
        await DataSeeder.SeedAsync(db, logger);
        logger.LogInformation("Database initialized successfully");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database initialization failed — check DATABASE_URL / Postgres connection");
    }
}
