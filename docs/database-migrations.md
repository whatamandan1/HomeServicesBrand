# Database migrations

The API uses **EF Core migrations** instead of `EnsureCreated`. Migrations run automatically when the API starts (`DatabaseInitializer` in `Program.cs`).

## Local development (SQLite)

Default connection: `Data Source=sorted.db` in `appsettings.json`.

```bash
# Apply pending migrations
./scripts/db-migrate.sh

# Add a new migration after changing entities
./scripts/db-add-migration.sh AddSomeFeature
```

Requires the EF CLI tool (one-time):

```bash
dotnet tool install --global dotnet-ef
export PATH="$PATH:$HOME/.dotnet/tools"
```

## Production / staging (PostgreSQL on Railway)

1. Add a PostgreSQL service and link it to the API (see [`deploy-staging.md`](deploy-staging.md)).
2. Deploy — migrations apply on startup; seed data runs if the database is empty.
3. Verify: `GET https://YOUR-API/health` → `"database": "postgresql"`, `"canConnect": true`.

## Legacy databases

If you deployed before migrations (using `EnsureCreated`), existing tables are detected on startup and the initial migration is stamped in `__EFMigrationsHistory` so new migrations can apply without recreating tables.

## Files

| Path | Purpose |
|------|---------|
| `src/backend/Sorted.Infrastructure/Data/Migrations/` | Migration history |
| `src/backend/Sorted.Infrastructure/Data/SortedDbContextFactory.cs` | Design-time factory for `dotnet ef` |
| `src/backend/Sorted.Infrastructure/Data/DatabaseInitializer.cs` | Startup migrate + legacy stamp + seed |
| `scripts/db-migrate.sh` | Apply migrations locally |
| `scripts/db-add-migration.sh` | Scaffold a new migration |

## Adding schema changes

1. Update entities in `Sorted.Core/Entities/` and `SortedDbContext` if needed.
2. Run `./scripts/db-add-migration.sh YourMigrationName`.
3. Commit the new files under `Data/Migrations/`.
4. Deploy — Railway applies the migration on next API startup.

Migrations are generated against **SQLite** so they work for local dev and PostgreSQL on Railway.
