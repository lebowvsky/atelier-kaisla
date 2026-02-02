# Database Seeders

This directory contains database seeders for populating the database with test data.

## Available Seeders

### Product Seeder

Seeds the database with realistic sample products for both categories:
- **Wall Hangings**: 8 diverse products (macramé, tapestries, fiber art, etc.)
- **Rugs**: 10 diverse products (Berber, kilim, modern, vintage, etc.)

Each product includes:
- Realistic names and descriptions
- Various statuses (available, sold, draft)
- Stock quantities
- Dimensions in cm
- Material information
- Sample image URLs (from Unsplash)

## Usage

### Running the Seeder

```bash
# From the backend directory (apps/backend/)

# Seed without cleaning (adds to existing data)
npm run seed

# Seed with clean (removes all existing products first)
npm run seed:clean
```

### Using Docker

```bash
# From project root

# Access backend container shell
make backend-shell

# Then run seeder inside container
npm run seed
# or
npm run seed:clean
```

## Environment Variables

The seeder uses the following environment variables from your `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=atelier_kaisla
```

## Seeder Details

### Product Seeder (`product.seeder.ts`)

**Wall Hanging Products (8 total):**
- 5 available (in stock)
- 1 sold (out of stock)
- 1 draft (not yet published)
- 1 with multiple stock quantity

**Rug Products (10 total):**
- 7 available (in stock)
- 1 sold (out of stock)
- 1 draft (not yet published)
- Various sizes and styles

### Adding New Seeders

To create a new seeder:

1. Create a new file: `src/database/seeds/your-entity.seeder.ts`
2. Implement the seeder class:

```typescript
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { YourEntity } from '../../entities/your-entity.entity';

export class YourEntitySeeder {
  private readonly logger = new Logger(YourEntitySeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async run(clean: boolean = false): Promise<void> {
    this.logger.log('Starting YourEntity seeder...');

    const repository = this.dataSource.getRepository(YourEntity);

    if (clean) {
      await repository.delete({});
    }

    const data = [
      // Your seed data
    ];

    const entities = repository.create(data);
    await repository.save(entities);

    this.logger.log(`Created ${entities.length} entities`);
  }
}
```

3. Add it to `seed.ts`:

```typescript
import { YourEntitySeeder } from './your-entity.seeder';
import { YourEntity } from '../../entities/your-entity.entity';

// Add YourEntity to DataSource entities
entities: [Product, YourEntity],

// Run the seeder
const yourEntitySeeder = new YourEntitySeeder(dataSource);
await yourEntitySeeder.run(cleanFlag);
```

## Best Practices

1. **Clean Flag**: Use `--clean` flag carefully in development, never in production
2. **Realistic Data**: Use realistic and diverse data for better testing
3. **Error Handling**: All seeders include proper error handling and logging
4. **Idempotency**: Design seeders to be safely run multiple times
5. **Documentation**: Document what each seeder does and what data it creates

## Troubleshooting

### Connection Issues

If you get database connection errors:

1. Check that PostgreSQL is running (Docker: `docker compose ps`)
2. Verify your `.env` file has correct database credentials
3. Ensure the database exists (created by init scripts)

### Permission Issues

If you get permission errors:

```bash
# Make seed script executable
chmod +x src/database/seeds/seed.ts
```

### TypeScript Errors

If you get module resolution errors:

```bash
# Rebuild the project
npm run build
```

## Notes

- Seeders use direct DataSource connection (not NestJS DI)
- Image URLs use Unsplash placeholder images
- All prices are in euros (EUR)
- Dimensions use metric system (cm)
- Seeds are designed for development/testing only
