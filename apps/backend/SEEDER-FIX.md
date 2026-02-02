# Fix: Seeder Database Connection Issue

## Problem

The seeder was failing with the error:
```
Error: getaddrinfo ENOTFOUND postgres
```

This error occurred because the seeder was trying to connect to the hostname `postgres` (the Docker service name) when executed from the host machine, where this hostname doesn't resolve.

## Root Cause

The database connection configuration had a fallback value of `'postgres'` when `POSTGRES_HOST` was not defined in the `.env` file. This works inside Docker containers but fails when running scripts locally from the host machine.

## Solution

### 1. Added POSTGRES_HOST to .env file

Updated `/Users/bricelegallo/dev/side-projects/atelier-kaisla/.env`:

```bash
# Configuration de la base de données PostgreSQL - Développement
POSTGRES_HOST=localhost  # NEW: Added this line
POSTGRES_DB=atelier_kaisla_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
```

### 2. Updated environment examples

Updated `.env.dev.example`:
```bash
# Note: Use "localhost" when running commands locally (migrations, seeds)
#       Use "postgres" when running inside Docker containers
POSTGRES_HOST=localhost
```

Updated `.env.prod.example`:
```bash
# Note: Use "postgres" in production Docker environment
POSTGRES_HOST=postgres
```

### 3. Improved seeder code

Enhanced `/Users/bricelegallo/dev/side-projects/atelier-kaisla/apps/backend/src/database/seeds/seed.ts`:

- Added better documentation explaining environment setup
- Added debug output showing connection details (host, port, database, user)
- Extracted connection parameters into variables for better visibility
- Changed default fallback from `'postgres'` to `'localhost'`

### 4. Added Makefile commands

Added convenient commands to `/Users/bricelegallo/dev/side-projects/atelier-kaisla/Makefile`:

**From host machine:**
```bash
make seed                 # Run seeder (append mode)
make seed-clean          # Run seeder (clean mode)
make migration-run       # Run migrations
make migration-generate NAME=MigrationName  # Generate migration
```

**Inside Docker:**
```bash
make seed-docker         # Run seeder in Docker
make seed-docker-clean   # Run seeder in Docker (clean mode)
make migration-run-docker # Run migrations in Docker
```

### 5. Updated documentation

Enhanced `/Users/bricelegallo/dev/side-projects/atelier-kaisla/apps/backend/DATABASE.md` with:
- Detailed seeder usage instructions
- Troubleshooting section for common errors
- Environment variable configuration guide
- Examples for both local and Docker execution

## How It Works Now

### Environment Detection

The system automatically uses the correct database host based on where the command is executed:

| Execution Context | POSTGRES_HOST Value | Resolves To |
|------------------|---------------------|-------------|
| Host machine (local) | `localhost` (from .env) | 127.0.0.1:5432 |
| Inside Docker container | `postgres` (from Docker Compose env override) | postgres service in Docker network |

### Docker Compose Override

The `docker-compose.dev.yml` file overrides the environment variables inside containers:

```yaml
backend:
  environment:
    - DATABASE_HOST=postgres  # Overrides POSTGRES_HOST for container
```

The code checks for both `POSTGRES_HOST` and `DATABASE_HOST`:
```typescript
host: process.env.POSTGRES_HOST || process.env.DATABASE_HOST || 'localhost',
```

## Testing Results

All commands now work correctly:

### From Host Machine
```bash
$ make seed
Database host: localhost:5432
Database connected successfully!
✓ Seeding completed successfully!
```

### Inside Docker
```bash
$ make seed-docker
Database host: postgres:5432
Database connected successfully!
✓ Seeding completed successfully!
```

## Files Modified

1. `/Users/bricelegallo/dev/side-projects/atelier-kaisla/.env`
2. `/Users/bricelegallo/dev/side-projects/atelier-kaisla/.env.dev.example`
3. `/Users/bricelegallo/dev/side-projects/atelier-kaisla/.env.prod.example`
4. `/Users/bricelegallo/dev/side-projects/atelier-kaisla/apps/backend/src/database/seeds/seed.ts`
5. `/Users/bricelegallo/dev/side-projects/atelier-kaisla/apps/backend/src/database/data-source.ts`
6. `/Users/bricelegallo/dev/side-projects/atelier-kaisla/apps/backend/DATABASE.md`
7. `/Users/bricelegallo/dev/side-projects/atelier-kaisla/Makefile`

## Best Practices

1. **Local Development**: Always use `POSTGRES_HOST=localhost` in your `.env` file
2. **Docker Execution**: Use `make *-docker` commands when you want to run inside containers
3. **Production**: Use `POSTGRES_HOST=postgres` in production `.env` for Docker environments
4. **Debugging**: Check the seeder output which now shows the connection details being used

## Prevention

To prevent this issue in the future:

1. Always define `POSTGRES_HOST` in your `.env` file
2. Use the provided Makefile commands instead of running npm scripts directly
3. Check the seeder output to verify you're connecting to the correct host
4. If you get `ENOTFOUND postgres`, it means you're running locally but haven't set `POSTGRES_HOST=localhost`

## Additional Notes

- The same fix applies to migrations (`migration:run`, `migration:generate`, etc.)
- The backend application running in Docker will automatically use `postgres` as the host via Docker Compose env override
- Local TypeORM CLI commands (migrations) will use `localhost` from the `.env` file
