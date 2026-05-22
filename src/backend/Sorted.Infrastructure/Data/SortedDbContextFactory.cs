using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Sorted.Infrastructure.Data;

/// <summary>
/// Design-time factory for <c>dotnet ef</c> commands. Uses SQLite by default; set DATABASE_URL for PostgreSQL.
/// </summary>
public class SortedDbContextFactory : IDesignTimeDbContextFactory<SortedDbContext>
{
    public SortedDbContext CreateDbContext(string[] args)
    {
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "Sorted.Api");
        if (!Directory.Exists(basePath))
            basePath = Directory.GetCurrentDirectory();

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = DatabaseConfiguration.ResolveConnectionString(configuration);
        var optionsBuilder = new DbContextOptionsBuilder<SortedDbContext>();

        if (DatabaseConfiguration.IsPostgres(connectionString))
            optionsBuilder.UseNpgsql(connectionString);
        else
            optionsBuilder.UseSqlite(connectionString);

        return new SortedDbContext(optionsBuilder.Options);
    }
}
