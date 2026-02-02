# Database Seeder Usage Guide

This guide explains how to use the database seeder to populate your development database with test data.

## Overview

The seeder creates realistic sample products in two categories:
- **8 Wall Hanging products** (macramé, tapestries, fiber art, etc.)
- **10 Rug products** (Berber, kilim, modern, vintage, etc.)

Each product includes:
- Name and description
- Price (in EUR)
- Category (wall-hanging or rug)
- Status (available, sold, or draft)
- Stock quantity
- Dimensions (width x height in cm)
- Materials description
- Sample images from Unsplash

## Prerequisites

1. Ensure PostgreSQL is running
2. Database should be created (automatically done via Docker init scripts)
3. Backend dependencies installed: `npm install`

## Running the Seeder

### Option 1: Using npm scripts (Recommended)

```bash
# Navigate to backend directory
cd apps/backend

# Run seeder (adds products to existing data)
npm run seed

# Run seeder with clean flag (removes ALL existing products first)
npm run seed:clean
```

### Option 2: Using Docker

```bash
# From project root, access backend container
make backend-shell

# Inside the container, run seeder
npm run seed

# Or with clean flag
npm run seed:clean
```

### Option 3: Direct execution

```bash
cd apps/backend

# With ts-node
npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts

# With clean flag
npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts --clean
```

## Output Example

```
========================================
  Database Seeder
========================================
Clean mode: DISABLED
========================================

Connecting to database...
Database connected successfully!

[ProductSeeder] Starting product seeder...
[ProductSeeder] Created 8 wall-hanging products
[ProductSeeder] Created 10 rug products

========================================
Seeding Statistics:
Total products: 18
Wall hangings: 8
Rugs: 10
Available: 13
Sold: 2
Draft: 3
========================================

[ProductSeeder] Seeding completed successfully! Total products: 18

========================================
  Seeding completed successfully!
========================================

Database connection closed.
```

## Environment Variables

The seeder uses these environment variables (from root `.env` or backend `.env`):

```env
# Docker naming (used when running in containers)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=atelier_kaisla_dev

# Alternative naming (if needed)
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=atelier_kaisla_dev
```

The seeder automatically detects which naming convention to use.

## Clean Mode

The `--clean` flag removes ALL existing products before seeding.

### When to use clean mode:

- Fresh database setup
- Resetting test data
- Removing old/corrupted data

### When NOT to use clean mode:

- Production environments (NEVER!)
- When you have real customer data
- When you want to add test data to existing products

```bash
# SAFE: Adds 18 products to existing data
npm run seed

# CAUTION: Deletes ALL products, then adds 18
npm run seed:clean
```

## Verifying Results

### Using PostgreSQL CLI

```bash
# Access database
make db-shell

# Check products count
SELECT category, status, COUNT(*)
FROM products
GROUP BY category, status;

# View all products
SELECT id, name, category, price, status, stock_quantity
FROM products
ORDER BY created_at DESC;

# Exit
\q
```

### Using Backend API

```bash
# Start backend server
cd apps/backend
npm run start:dev

# Query products API
curl http://localhost:4000/api/products

# Get wall hangings
curl http://localhost:4000/api/products/category/wall-hanging

# Get rugs
curl http://localhost:4000/api/products/category/rug

# Get statistics
curl http://localhost:4000/api/products/statistics
```

## Sample Products Created

### Wall Hangings (8 products)
- Sunset Dreams Macramé (€149.99) - Available
- Boho Fringe Wall Art (€89.99) - Available
- Nordic Geometric Tapestry (€199.99) - Available
- Coastal Breeze Weaving (€129.99) - Sold
- Terra Cotta Dream Catcher (€79.99) - Available
- Abstract Fiber Art (€249.99) - Draft
- Rainbow Macramé Small (€59.99) - Available
- Minimalist Line Wall Art (€99.99) - Available

### Rugs (10 products)
- Moroccan Berber Rug (€459.99) - Available
- Scandinavian Minimal Runner (€189.99) - Available
- Bohemian Kilim Rug (€329.99) - Available
- Natural Jute Round Rug (€149.99) - Available
- Vintage Persian-Inspired Rug (€699.99) - Sold
- Modern Abstract Area Rug (€389.99) - Available
- Cozy Shag Rug (€229.99) - Available
- Striped Cotton Dhurrie (€119.99) - Draft
- Ethnic Tribal Runner (€169.99) - Available
- Pastel Tufted Rug (€279.99) - Available

## Troubleshooting

### Error: Cannot connect to database

**Solution:**
1. Check PostgreSQL is running: `docker compose ps`
2. Verify environment variables in `.env`
3. Ensure database is created

```bash
# Check if database exists
make db-shell
\l
\q
```

### Error: Module not found

**Solution:**
```bash
cd apps/backend
npm install
npm run build
```

### Error: Permission denied

**Solution:**
```bash
# Make script executable
chmod +x src/database/seeds/seed.ts
```

### No output or hangs

**Solution:**
1. Check database connection settings
2. Verify no firewall blocking port 5432
3. Check Docker network if using containers

## Adding Custom Products

To add your own products to the seeder:

1. Edit: `src/database/seeds/data/products.data.ts`
2. Add products to `wallHangingProducts` or `rugProducts` arrays
3. Run seeder: `npm run seed`

Example:

```typescript
{
  name: 'My Custom Wall Hanging',
  description: 'A beautiful handmade piece',
  category: 'wall-hanging',
  price: 199.99,
  status: 'available',
  stockQuantity: 1,
  images: ['https://example.com/image.jpg'],
  dimensions: {
    width: 50,
    height: 70,
    unit: 'cm',
  },
  materials: 'Cotton, wool',
}
```

## Best Practices

1. **Development**: Run seeder after fresh database setup
2. **Testing**: Use `--clean` flag to reset data between tests
3. **CI/CD**: Include seeder in automated testing pipelines
4. **Production**: NEVER run seeder in production environments
5. **Backup**: Always backup data before using `--clean` flag

## Related Documentation

- [Backend README](../../README.md)
- [Seeder Implementation](src/database/seeds/README.md)
- [Product Entity](src/entities/product.entity.ts)
- [Database Configuration](src/config/database.config.ts)

## Support

For issues or questions:
1. Check Docker logs: `make dev-logs-backend`
2. Verify environment configuration
3. Review seeder logs for error details
