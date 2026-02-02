# Database Seeder - Start Here

Welcome to the Atelier Kaisla database seeder documentation!

## Quick Start

```bash
# Navigate to backend directory
cd apps/backend

# Seed database (adds 18 products)
npm run seed

# Reset and seed (removes all products first)
npm run seed:clean
```

That's it! You now have 18 realistic test products in your database.

## What You Get

- **8 Wall Hanging Products**: macramé, tapestries, fiber art, dream catchers
- **10 Rug Products**: Berber, kilim, modern, vintage, runners
- **Realistic Data**: names, descriptions, prices, dimensions, images
- **Various Statuses**: available (14), sold (2), draft (2)

## Documentation Guide

Choose your path based on what you need:

### 🚀 I Just Want to Use It
**Read:** [`../../SEEDER_USAGE.md`](../../SEEDER_USAGE.md)

Complete user guide with:
- Prerequisites
- Running instructions (3 methods)
- Environment variables
- Output examples
- Troubleshooting

### 📊 I Want a Quick Overview
**Read:** [`SUMMARY.md`](./SUMMARY.md)

Quick reference with:
- Quick start commands
- Features overview
- Test results (with real output)
- Products created (tables)
- Quick commands reference

### 👨‍💻 I'm a Developer
**Read:** [`README.md`](./README.md)

Technical documentation with:
- How it works
- Adding new seeders
- Best practices
- Troubleshooting

### 🔍 I Want All the Details
**Read:** [`IMPLEMENTATION.md`](./IMPLEMENTATION.md)

Complete implementation guide with:
- Architecture decisions
- Technical specifications
- Performance metrics
- Security considerations
- Maintenance guidelines

### 📁 I Want to See the Structure
**Read:** [`FILES_OVERVIEW.md`](./FILES_OVERVIEW.md) or [`TREE.txt`](./TREE.txt)

File structure documentation with:
- Directory tree
- File descriptions
- Dependencies
- Line counts
- Maintenance guide

## At a Glance

### Files Created

```
database/seeds/
├── seed.ts                    # CLI entry point
├── product.seeder.ts          # Seeder implementation
├── data/
│   └── products.data.ts       # Product data (18 products)
└── [documentation files]
```

### Commands

```bash
npm run seed              # Add products (keeps existing)
npm run seed:clean        # Reset and add products
```

### Environment Variables

The seeder automatically detects these variables:
- `POSTGRES_HOST` / `DATABASE_HOST`
- `POSTGRES_PORT` / `DATABASE_PORT`
- `POSTGRES_USER` / `DATABASE_USER`
- `POSTGRES_PASSWORD` / `DATABASE_PASSWORD`
- `POSTGRES_DB` / `DATABASE_NAME`

### Output Example

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
Available: 14
Sold: 2
Draft: 2
========================================

[ProductSeeder] Seeding completed successfully! Total products: 18

========================================
  Seeding completed successfully!
========================================

Database connection closed.
```

## Verify Results

### Database Verification

```bash
make db-shell

# Inside PostgreSQL
SELECT COUNT(*) FROM products;
SELECT category, status, COUNT(*) FROM products GROUP BY category, status;
\q
```

### API Verification

```bash
# Statistics
curl http://localhost:4000/products/statistics

# List products
curl http://localhost:4000/products?limit=5

# Wall hangings only
curl http://localhost:4000/products/category/wall-hanging

# Rugs only
curl http://localhost:4000/products/category/rug
```

## Common Use Cases

### Fresh Development Setup
```bash
npm run seed:clean
```

### Add More Test Data
```bash
npm run seed
```

### Reset Before Testing
```bash
npm run seed:clean
```

### Docker Environment
```bash
make backend-shell
npm run seed
```

## Need Help?

### Error: Cannot connect to database
1. Check Docker is running: `docker compose ps`
2. Verify environment variables in `.env`
3. Ensure database is initialized

### Error: Module not found
```bash
cd apps/backend
npm install
```

### Want to add your own products?
Edit: `src/database/seeds/data/products.data.ts`

## What's Next?

After seeding, you can:
1. ✅ Start the backend: `npm run start:dev`
2. ✅ Test API endpoints (see above)
3. ✅ View in database (see above)
4. ✅ Use in frontend development
5. ✅ Run integration tests

## Documentation Map

```
START_HERE.md (You are here)
    │
    ├─── Quick Start → SEEDER_USAGE.md
    │    └── How to run, troubleshooting
    │
    ├─── Overview → SUMMARY.md
    │    └── Quick reference, test results
    │
    ├─── Technical → README.md
    │    └── Developer guide, extending
    │
    ├─── Detailed → IMPLEMENTATION.md
    │    └── Complete specs, architecture
    │
    └─── Structure → FILES_OVERVIEW.md, TREE.txt
         └── File structure, dependencies
```

## Features Highlights

✅ **18 Realistic Products** - Wall hangings and rugs with real descriptions
✅ **Clean Mode** - Reset database with one command
✅ **Type Safe** - Full TypeScript support
✅ **Docker Ready** - Works in containers
✅ **Well Documented** - 5 levels of documentation
✅ **Error Handling** - Comprehensive error messages
✅ **Statistics** - See what was created
✅ **Verified** - Tested with database and API

## Quick Reference

| Task | Command |
|------|---------|
| Seed database | `npm run seed` |
| Reset and seed | `npm run seed:clean` |
| Access database | `make db-shell` |
| View backend logs | `make dev-logs-backend` |
| Enter backend shell | `make backend-shell` |
| Test API | `curl http://localhost:4000/products` |

## Important Notes

⚠️ **Clean Mode Warning**: `npm run seed:clean` removes ALL existing products

✅ **Safe to Run**: You can run `npm run seed` multiple times

🐳 **Docker**: Automatically uses container environment variables

📝 **Documentation**: 5 files covering different aspects and audiences

## Product Examples

### Wall Hangings
- Sunset Dreams Macramé (€149.99)
- Nordic Geometric Tapestry (€199.99)
- Rainbow Macramé Small (€59.99)

### Rugs
- Moroccan Berber Rug (€459.99)
- Natural Jute Round Rug (€149.99)
- Vintage Persian-Inspired Rug (€699.99)

All products include descriptions, dimensions, materials, and images!

## Support

- **User Guide**: Read `SEEDER_USAGE.md`
- **Technical Issues**: Check `README.md` troubleshooting section
- **Implementation Details**: See `IMPLEMENTATION.md`
- **File Questions**: Check `FILES_OVERVIEW.md`

## Status

✅ **Complete and Tested**
- Database verified
- API verified
- Docker tested
- Documentation complete

---

**Version:** 1.0.0
**Date:** February 2, 2026
**Status:** Production Ready for Development/Testing

**Ready to start?** Run `npm run seed` now! 🚀
