# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Atelier Kaisla is an e-commerce platform for handcrafted wall art and rugs built as a monorepo with three main applications:

- **Frontend**: Customer-facing Nuxt 4 application (port 3002)
- **Backoffice**: Admin panel using Nuxt 4 (port 3001)
- **Backend**: NestJS API server with TypeScript and PostgreSQL (port 4000)

## Development Setup

### Docker Environment (Recommended)

The project uses Docker for consistent development environments with hot reloading enabled for all applications.

```bash
# Initialize project (creates .env and starts all services)
make init

# Start development environment in background
make dev-up-d

# View logs (all services)
make dev-logs

# View logs for specific service
make dev-logs-frontend
make dev-logs-backend
make dev-logs-backoffice

# Stop all services
make dev-down

# Rebuild after dependency changes
make dev-rebuild

# Access shell in containers
make frontend-shell
make backend-shell
make backoffice-shell
make db-shell

# Clean rebuild (if experiencing issues)
make clean-dev
make init
```

### Without Docker

```bash
# Frontend (from apps/frontend/)
npm install
npm run dev

# Backend (from apps/backend/)
npm install
npm run start:dev

# Backoffice (from apps/backoffice/)
npm install
npm run dev
```

## Testing

### Backend Tests (NestJS)

```bash
# From apps/backend/
npm run test              # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Run tests with coverage
npm run test:e2e          # Run end-to-end tests
```

### Linting and Formatting

```bash
# Backend
npm run lint              # Lint TypeScript files
npm run format            # Format with Prettier
```

## Build Commands

### Frontend/Backoffice (Nuxt 4)

```bash
npm run build             # Build for production
npm run preview           # Preview production build locally
npm run generate          # Generate static site
```

### Backend (NestJS)

```bash
npm run build             # Compile TypeScript to dist/
npm run start:prod        # Run production build
```

## Architecture

### Monorepo Structure

```
apps/
├── frontend/          # Nuxt 4 customer-facing app
│   ├── app/
│   │   ├── components/    # Vue components
│   │   ├── composables/   # Reusable composition functions
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # File-based routes
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Pure utility functions
│   └── public/            # Static assets
├── backoffice/        # Nuxt 4 admin panel
└── backend/           # NestJS API
    └── src/
        ├── *.module.ts       # NestJS modules
        ├── *.controller.ts   # Route controllers
        └── *.service.ts      # Business logic

packages/              # Shared code (future use)
├── shared-types/
└── shared-utils/

docker/                # Docker configuration
└── postgres/
    └── init-scripts/  # Database initialization SQL
```

### Frontend Architecture Patterns

The frontend follows functional programming and composition patterns:

1. **Composables**: Reusable logic extracted to `composables/` (e.g., `useNavigation.ts`, `useProducts.ts`)
2. **Pure utilities**: Side-effect-free functions in `utils/`
3. **Type safety**: All types defined in `types/` directory
4. **File-based routing**: Pages in `pages/` automatically become routes
5. **Scoped styles**: Component styles use `<style scoped>` with SCSS

#### API Integration

The frontend integrates with the backend using design patterns:

- **Adapter Pattern**: Converts backend `Product` entities to frontend `Artwork` interfaces
- **Facade Pattern**: Simplifies API interactions through `useProducts` composable
- **Decorator Pattern**: Adds loading/error state management to async operations

See `/apps/frontend/API-INTEGRATION.md` for detailed documentation.

### SCSS Architecture

Global SCSS variables and mixins are automatically imported in all components:

- `assets/styles/_variables.scss`: Colors, fonts, spacing
- `assets/styles/_mixins.scss`: Reusable style patterns
- `assets/styles/main.scss`: Global styles and resets

Configuration in `nuxt.config.ts` makes variables/mixins available without explicit imports.

### Backend Architecture

NestJS follows modular architecture:

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Modules**: Organize features
- **TypeORM**: Database ORM with PostgreSQL
- **Class validators**: DTO validation with `class-validator` and `class-transformer`

### Database

- **PostgreSQL 16** (Alpine)
- **Connection**: Backend connects via Docker network to `postgres:5432`
- **Initialization**: SQL scripts in `docker/postgres/init-scripts/` run on first start
- **Data persistence**: Volume `postgres_data_dev` persists data between container restarts

## Key Technologies

- **Nuxt 4.3.0** with Vue 3.5.27 and TypeScript
- **NestJS 11** with TypeScript
- **PostgreSQL 16** (Alpine)
- **Docker & Docker Compose** for containerization
- **SCSS** with sass-embedded for styling

## Environment Configuration

- `.env.dev.example`: Development environment template
- `.env.prod.example`: Production environment template
- `.env`: Local environment file (not committed, created from example)

## Important Files

- `Makefile`: Docker commands shortcuts
- `docker-compose.dev.yml`: Development container orchestration
- `docker-compose.prod.yml`: Production container orchestration
- `DOCKER-QUICKSTART.md`: Detailed Docker setup instructions
- `apps/frontend/ARCHITECTURE.md`: Frontend architecture deep dive

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3002
lsof -i :4000

# Kill process if needed
kill -9 <PID>
```

### Frontend SASS Issues

If frontend fails to start due to sass-embedded issues:

```bash
make dev-frontend-fix
```

This rebuilds the frontend container from scratch without cache.

### Database Connection Issues

```bash
# Check PostgreSQL is healthy
docker compose -f docker-compose.dev.yml ps

# View database logs
docker compose -f docker-compose.dev.yml logs postgres

# Access database directly
make db-shell
```

### CORS Issues (RESOLVED)

Both the frontend (`https://kaisla.lebowvsky.com`) and backoffice (`https://bokaisla.lebowvsky.com`) can now make requests to the API (`https://api.lebowvsky.com`) without CORS errors in both development and production.

**Quick test**:
```bash
# Test frontend in development
./test-frontend-api.sh

# Test CORS in production
./test-cors.sh https://api.lebowvsky.com https://bokaisla.lebowvsky.com https://kaisla.lebowvsky.com
```

**Documentation**:
- Frontend CORS fix (new): `/QUICK-FIX-FRONTEND-CORS.md`
- Frontend detailed: `/FRONTEND-CORS-FIX.md`
- Frontend before/after: `/FRONTEND-CORS-BEFORE-AFTER.md`
- Frontend summary: `/FRONTEND-CORS-SUMMARY.md`
- Backoffice CORS: `/CORS-FIX-SUMMARY.md`
- Deployment: `/DEPLOYMENT-CORS-FIX.md`
- Troubleshooting: `/CORS-TROUBLESHOOTING.md`

**Common issues**:
- CORS errors persist: Check Traefik configuration (remove CORS middleware)
- Environment variables: Verify `FRONTEND_URL` and `BACKOFFICE_URL` are set correctly
- Check backend logs: `docker compose -f docker-compose.prod.yml logs -f backend | grep CORS`
- Frontend development: Browser console should show `http://localhost:4000/api`, NOT `http://backend:4000/api`

### Product Upload Issues (RESOLVED)

The `POST /api/products/with-upload` endpoint has been fixed for both dimensions validation and image uploads.

**Quick test**:
```bash
./test-product-upload.sh
```

**Documentation**:
- Quick start: `/QUICK-START-UPLOAD.md`
- Detailed fixes: `/FIXES-SUMMARY.md`
- Technical docs: `/PRODUCT-UPLOAD-FIX.md`

**Common issues**:
- Images not accessible: Check backend logs and verify upload directory exists
- Dimensions validation errors: Ensure JSON string format: `'{"width": 120, "height": 180, "unit": "cm"}'`

## Code Conventions

### Frontend (Vue/Nuxt)

- Use Composition API with `<script setup lang="ts">`
- Define types in dedicated `.d.ts` files in `types/` directory
- Composables return computed properties and methods
- Pure functions in `utils/` should have no side effects
- Components use scoped SCSS styles
- SEO: Use `useSeoMeta()` in page components

### Backend (NestJS)

- Follow NestJS module/controller/service pattern
- Use DTOs with class-validator decorators
- Type all method parameters and return types
- Use dependency injection for services
- Keep controllers thin, logic in services

## Production Deployment

```bash
# Copy production environment template
cp .env.prod.example .env

# IMPORTANT: Update PostgreSQL password in .env

# Start production environment
make prod-up

# View production logs
make prod-logs
```

## Current Implementation Status

### Frontend
- Fully responsive navigation bar with mobile menu
- 5 main pages (Home, Wall Hanging, Rugs, About, Blog)
- **Real API integration** for products (wall hangings and rugs)
- SEO optimization with meta tags
- Accessibility features (ARIA, keyboard navigation)
- TypeScript support throughout
- Loading and error state management

### Backend
- NestJS REST API with TypeORM
- Products module with full CRUD operations
- PostgreSQL database integration
- Swagger API documentation (`http://localhost:4000/api/docs`)
- CORS configured for frontend/backoffice
- Database seeding capabilities

### Backoffice
- Starter template ready for development

## Testing API Integration

Run the test script to verify the integration:

```bash
./test-api-integration.sh
```

Or manually test endpoints:

```bash
# Get wall hangings
curl http://localhost:4000/api/products/category/wall-hanging

# Get rugs
curl http://localhost:4000/api/products/category/rug

# View API documentation
open http://localhost:4000/api/docs
```

For detailed integration documentation, see:
- `/FRONTEND-BACKEND-INTEGRATION.md` - Quick start guide
- `/apps/frontend/API-INTEGRATION.md` - Detailed technical documentation
- `/apps/backend/README.md` - Backend API reference
