import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from project root
// Try multiple locations to support both local and Docker environments
dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // Root of monorepo
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

/**
 * TypeORM DataSource for migrations
 * This file is used by TypeORM CLI for generating and running migrations
 *
 * Environment setup:
 * - Local development: Set POSTGRES_HOST=localhost in .env
 * - Docker environment: Set POSTGRES_HOST=postgres in .env or use DATABASE_HOST
 *
 * Usage:
 * - Generate migration: npm run migration:generate -- src/database/migrations/MigrationName
 * - Create empty migration: npm run migration:create -- src/database/migrations/MigrationName
 * - Run migrations: npm run migration:run
 * - Revert migration: npm run migration:revert
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  // Support both POSTGRES_* and DATABASE_* variable naming
  // Default to 'localhost' for local development (not 'postgres')
  host: process.env.POSTGRES_HOST || process.env.DATABASE_HOST || 'localhost',
  port: parseInt(
    process.env.POSTGRES_PORT || process.env.DATABASE_PORT || '5432',
    10,
  ),
  username:
    process.env.POSTGRES_USER || process.env.DATABASE_USER || 'postgres',
  password:
    process.env.POSTGRES_PASSWORD ||
    process.env.DATABASE_PASSWORD ||
    'postgres',
  database:
    process.env.POSTGRES_DB ||
    process.env.DATABASE_NAME ||
    'atelier_kaisla_dev',

  // Entities
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  // Migrations
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'migrations_history',

  // Logging
  logging: process.env.NODE_ENV !== 'production',
  logger: 'advanced-console',

  // Synchronize should be false when using migrations in production
  // For development, we can enable it temporarily but migrations are preferred
  synchronize: false,
});
