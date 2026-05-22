# Build context: repository root (see railway.toml)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/backend/Sorted.sln ./
COPY src/backend/Sorted.Core/Sorted.Core.csproj Sorted.Core/
COPY src/backend/Sorted.Infrastructure/Sorted.Infrastructure.csproj Sorted.Infrastructure/
COPY src/backend/Sorted.Api/Sorted.Api.csproj Sorted.Api/
RUN dotnet restore Sorted.sln
COPY src/backend/ .
RUN dotnet publish Sorted.Api/Sorted.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
# Railway sets PORT; Program.cs binds to 0.0.0.0:$PORT
EXPOSE 8080
ENTRYPOINT ["dotnet", "Sorted.Api.dll"]
