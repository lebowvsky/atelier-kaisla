<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Routes

All API endpoints are prefixed with `/api`. For example:

- Products: `http://localhost:4000/api/products`
- Documentation: `http://localhost:4000/api/docs`
- Product by ID: `http://localhost:4000/api/products/:id`

This follows industry best practices for:
- Clear API/frontend separation
- Future API versioning (`/api/v1`, `/api/v2`)
- Reverse proxy routing in production
- Consistent naming conventions

### Products API Endpoints

#### Get Products by Category
```bash
GET /api/products/category/:category
```
Fetch all available products for a specific category.

**Parameters:**
- `category`: `wall-hanging` or `rug`

**Example:**
```bash
curl http://localhost:4000/api/products/category/wall-hanging
```

**Response:** Array of Product objects with `status='available'`

#### Get All Products (with filters)
```bash
GET /api/products?category=&status=&search=&page=&limit=
```

**Query Parameters:**
- `category` (optional): Filter by category (`wall-hanging`, `rug`)
- `status` (optional): Filter by status (`available`, `sold`, `draft`)
- `search` (optional): Search products by name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```bash
curl "http://localhost:4000/api/products?category=rug&status=available&limit=20"
```

**Response:**
```json
{
  "data": [...],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

#### Create Product (JSON)
```bash
POST /api/products
Content-Type: application/json
```

Create a product with JSON payload (without file upload).

**Example:**
```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Handwoven Wall Hanging",
    "category": "wall-hanging",
    "price": 149.99,
    "description": "Beautiful handwoven wall hanging",
    "images": ["https://example.com/image1.jpg"]
  }'
```

#### Create Product with Image Upload
```bash
POST /api/products/with-upload
Content-Type: multipart/form-data
```

Create a product with file upload (1-5 images, max 5MB each).

**Required Fields:**
- `name` (string): Product name
- `category` (enum): "wall-hanging" or "rug"
- `price` (number): Product price
- `images` (files): 1-5 image files (JPEG, PNG, WebP)

**Optional Fields:**
- `description`, `status`, `stockQuantity`, `dimensions`, `materials`

**Example:**
```bash
curl -X POST http://localhost:4000/api/products/with-upload \
  -F "name=Handwoven Wall Hanging" \
  -F "category=wall-hanging" \
  -F "price=149.99" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Interactive Testing:**
- Open `apps/backend/test-upload.html` in your browser for a visual upload form
- Use Swagger UI at `http://localhost:4000/api/docs` for API testing

**Full Documentation:** See [UPLOAD-API.md](./UPLOAD-API.md) for complete upload API documentation.

#### Get Single Product
```bash
GET /api/products/:id
```

**Example:**
```bash
curl http://localhost:4000/api/products/uuid-here
```

#### Update Product
```bash
PATCH /api/products/:id
Content-Type: application/json
```

**Example:**
```bash
curl -X PATCH http://localhost:4000/api/products/uuid-here \
  -H "Content-Type: application/json" \
  -d '{"price": 199.99, "status": "sold"}'
```

#### Delete Product
```bash
DELETE /api/products/:id
```

**Example:**
```bash
curl -X DELETE http://localhost:4000/api/products/uuid-here
```

#### Get Product Statistics
```bash
GET /api/products/statistics
```

Returns product counts by category and status.

**Example:**
```bash
curl http://localhost:4000/api/products/statistics
```

**Response:**
```json
{
  "total": 18,
  "byCategory": {
    "wall-hanging": 8,
    "rug": 10
  },
  "byStatus": {
    "available": 15,
    "sold": 2,
    "draft": 1
  }
}
```

### API Documentation

Interactive Swagger documentation is available in development:

```
http://localhost:4000/api/docs
```

This provides a complete API reference with:
- All available endpoints
- Request/response schemas
- Try-it-out functionality
- Type definitions

## Database Seeding

Populate your database with test data using the comprehensive seeding system.

### Quick Start

```bash
# Development (Docker)
$ make seed-docker                  # Add sample products
$ make seed-docker-clean            # Reset and add products
$ make seed-enhanced-docker         # Smart seeding (prevents duplicates)

# Production (with safeguards)
$ make backup-prod                  # Always backup first!
$ make seed-enhanced-prod           # Seed with duplicate prevention
```

### Available Seeders

#### Standard Seeder
- Fast and simple
- Creates 18 realistic products (8 wall hangings, 10 rugs)
- May create duplicates if run multiple times

```bash
npm run seed          # Append mode
npm run seed:clean    # Clean mode (removes all products first)
```

#### Enhanced Seeder (Recommended for Production)
- Prevents duplicate products
- Updates existing products instead of creating new ones
- Provides detailed statistics
- Production-safe with confirmation prompts

```bash
npm run seed:enhanced              # Smart seeding
npm run seed:enhanced:clean        # Clean + smart seeding
```

### Data Verification

```bash
# Quick verification
$ make verify-quick-dev             # Development
$ make verify-quick-prod            # Production

# Complete integrity check
$ make verify-data-dev              # Development
$ make verify-data-prod             # Production
```

### Backup & Restore

```bash
# Create backups
$ make backup-dev                   # Development backup
$ make backup-prod                  # Production backup

# Restore from backup
$ make restore-prod FILE=backups/backup_prod_20260203_100000.sql
```

### Documentation

Complete seeding documentation available:

- **[SEEDING_QUICKSTART.md](./SEEDING_QUICKSTART.md)** - Quick reference guide with all commands
- **[SEEDING_GUIDE.md](./SEEDING_GUIDE.md)** - Complete guide for development and production
- **[SEEDING_BEST_PRACTICES.md](./SEEDING_BEST_PRACTICES.md)** - Best practices and recommendations
- **[src/database/seeds/README.md](./src/database/seeds/README.md)** - Technical implementation details

### Seeded Data

The seeding system creates 18 realistic products:
- 8 wall-hanging products (macramé, tapestries, fiber art, etc.)
- 10 rug products (Berber, kilim, modern, vintage, etc.)

Each product includes:
- Realistic names and descriptions
- Various statuses (available, sold, draft)
- Stock quantities
- Dimensions in cm
- Material information
- Sample image URLs

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
