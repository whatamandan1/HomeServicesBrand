using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Sorted.Core.Enums;
using Sorted.Core.Options;
using CorsOptions = Sorted.Core.Options.CorsOptions;
using Sorted.Infrastructure;
using Sorted.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Railway sets PORT; local dev defaults to 5080 (see launchSettings.json / scripts/dev-api.sh).
var port = Environment.GetEnvironmentVariable("PORT")
    ?? (builder.Environment.IsDevelopment() ? "5080" : "8080");
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var localSettings = Path.Combine(builder.Environment.ContentRootPath, "appsettings.Development.local.json");
builder.Configuration.AddJsonFile(localSettings, optional: true, reloadOnChange: true);

builder.Host.UseSerilog((ctx, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console());

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.Converters.Add(new GardenSizeJsonConverter());
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
var features = builder.Configuration.GetSection(FeaturesOptions.Section).Get<FeaturesOptions>() ?? new FeaturesOptions();
if (!builder.Environment.IsDevelopment())
{
    const string devJwtPlaceholder = "DEV_ONLY_CHANGE_IN_PRODUCTION_min_32_chars_long_secret";
    if (string.IsNullOrWhiteSpace(jwt.Secret)
        || jwt.Secret == devJwtPlaceholder
        || jwt.Secret == "CHANGE_ME_IN_PRODUCTION_USE_LONG_SECRET"
        || jwt.Secret.Length < 32)
    {
        throw new InvalidOperationException("Jwt:Secret must be set to a strong value (32+ characters) in production.");
    }

    if (string.IsNullOrWhiteSpace(builder.Configuration["Stripe:WebhookSecret"]))
    {
        throw new InvalidOperationException("Stripe:WebhookSecret must be set in production.");
    }

    if (features.BypassStripeCheckout)
    {
        throw new InvalidOperationException("Features:BypassStripeCheckout must be false in production.");
    }
}
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
    var sendGridConfigured = !string.IsNullOrWhiteSpace(config["SendGrid:ApiKey"]);
    var openAiConfigured = !string.IsNullOrWhiteSpace(config["OpenAI:ApiKey"]);
    var twilioConfigured = !string.IsNullOrWhiteSpace(config["Twilio:AccountSid"])
        && !string.IsNullOrWhiteSpace(config["Twilio:AuthToken"])
        && !string.IsNullOrWhiteSpace(config["Twilio:FromPhoneNumber"]);

    var cs = DatabaseConfiguration.ResolveConnectionString(config);
    if (!DatabaseConfiguration.IsPostgres(cs))
    {
        return Results.Ok(new
        {
            status = "ok",
            database = "sqlite",
            databaseSource = DatabaseConfiguration.DescribeSource(config),
            canConnect = true,
            userCount = await db.Users.CountAsync(),
            sendGridConfigured,
            openAiConfigured,
            twilioConfigured,
        });
    }

    var (canConnect, dbError, host, sslMode) = await DatabaseConfiguration.TestConnectionAsync(cs);
    var diagnostics = DatabaseConfiguration.DescribeDiagnostics(config);
    var parsedHost = config["DATABASE_URL"]?.Contains("railway.internal", StringComparison.OrdinalIgnoreCase) == true;
    var hint = canConnect
        ? null
        : parsedHost
            ? "Private URLs (*.railway.internal) only work when API and Postgres are in the SAME Railway project. Use DATABASE_PUBLIC_URL from Postgres, or move Postgres into the API project."
            : "Use DATABASE_PUBLIC_URL (cross-project) or link Postgres in the same project via PGHOST/PGUSER/PGPASSWORD.";

    var userCount = 0;
    if (canConnect)
    {
        try
        {
            userCount = await db.Users.CountAsync();
        }
        catch
        {
            // db context may not be ready yet
        }
    }

    return Results.Ok(new
    {
        status = "ok",
        database = "postgresql",
        databaseSource = DatabaseConfiguration.DescribeSource(config),
        diagnostics,
        canConnect,
        host,
        sslMode,
        dbError,
        hint,
        userCount,
        sendGridConfigured,
        openAiConfigured,
        twilioConfigured,
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
var twilioConfigured = !string.IsNullOrWhiteSpace(app.Configuration["Twilio:AccountSid"])
    && !string.IsNullOrWhiteSpace(app.Configuration["Twilio:AuthToken"])
    && !string.IsNullOrWhiteSpace(app.Configuration["Twilio:FromPhoneNumber"]);
startupLogger.LogInformation(
    "Sorted API starting — DB config: {Database} ({Source}) | Stripe: {StripeKey} | Webhook: {Webhook} | SendGrid: {SendGrid} | Twilio: {Twilio} | OpenAI: {OpenAi}",
    dbKind,
    dbSource,
    stripeConfigured ? "ok" : "missing",
    webhookConfigured ? "ok" : "missing",
    sendGridConfigured ? "ok" : "missing",
    twilioConfigured ? "ok" : "missing",
    openAiConfigured ? "ok" : "missing");

app.Run();

public partial class Program { }
