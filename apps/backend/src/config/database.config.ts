import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database configuration factory
 * Builds TypeORM configuration from environment variables
 * Supports both POSTGRES_* and DATABASE_* naming conventions
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    type: 'postgres',
    // Support both POSTGRES_* (from .env) and DATABASE_* (from Docker) variable naming
    host: process.env.POSTGRES_HOST || process.env.DATABASE_HOST || 'postgres',
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

    // Entity paths
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],

    // Migrations
    migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
    migrationsRun: false, // Don't auto-run migrations on application start
    migrationsTableName: 'migrations_history',

    // Synchronization - CRITICAL: Never use in production
    // In development, we prefer migrations but keep synchronize for rapid prototyping
    synchronize: !isProduction && process.env.TYPEORM_SYNC === 'true',

    // Logging
    logging: !isProduction ? ['query', 'error', 'warn'] : ['error'],
    logger: 'advanced-console',

    // Connection pool settings
    extra: {
      max: 10, // Maximum pool size
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    },

    // Additional options
    autoLoadEntities: true, // Automatically load entities from feature modules
    retryAttempts: 3,
    retryDelay: 3000,
  };
};
