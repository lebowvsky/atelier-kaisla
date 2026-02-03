import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { EnhancedProductSeeder } from './product.seeder.enhanced';
import { Product } from '../../entities/product.entity';
import * as readline from 'readline';

// Load environment variables
config();

/**
 * Enhanced Database Seeder CLI
 *
 * Features:
 * - Duplicate prevention (checks by product name)
 * - Updates existing products instead of creating duplicates
 * - Production safety with confirmation prompts
 * - Detailed operation statistics
 *
 * Usage:
 * - Run seeder with duplicate prevention: npm run seed:enhanced
 * - Run seeder and clean first: npm run seed:enhanced:clean
 * - Run seeder without duplicate check: npm run seed:enhanced -- --no-check
 *
 * Flags:
 * - --clean: Remove all existing products before seeding
 * - --no-check: Disable duplicate checking (faster but may create duplicates)
 */

/**
 * Ask for confirmation in production when using clean mode
 */
async function confirmProductionClean(nodeEnv: string): Promise<boolean> {
  if (nodeEnv !== 'production') {
    return true;
  }

  console.log('\n⚠️  ⚠️  ⚠️  WARNING ⚠️  ⚠️  ⚠️');
  console.log('You are about to DELETE all data in PRODUCTION!');
  console.log('This action is IRREVERSIBLE.');
  console.log('Make sure you have a backup before proceeding.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      'Type "DELETE ALL PRODUCTION DATA" to confirm: ',
      (answer) => {
        rl.close();

        if (answer === 'DELETE ALL PRODUCTION DATA') {
          console.log('\n✓ Confirmation received. Proceeding with clean seeding...\n');
          resolve(true);
        } else {
          console.log('\n❌ Confirmation failed. Operation cancelled.\n');
          resolve(false);
        }
      },
    );
  });
}

/**
 * Main seeder function
 */
async function runSeeders() {
  // Parse command line arguments
  const cleanFlag = process.argv.includes('--clean');
  const noCheckFlag = process.argv.includes('--no-check');
  const preventDuplicates = !noCheckFlag;
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Database connection configuration
  const dbHost = process.env.POSTGRES_HOST || process.env.DATABASE_HOST || 'localhost';
  const dbPort = parseInt(
    process.env.POSTGRES_PORT || process.env.DATABASE_PORT || '5432',
    10,
  );
  const dbUsername = process.env.POSTGRES_USER || process.env.DATABASE_USER || 'postgres';
  const dbPassword = process.env.POSTGRES_PASSWORD || process.env.DATABASE_PASSWORD || 'postgres';
  const dbName = process.env.POSTGRES_DB || process.env.DATABASE_NAME || 'atelier_kaisla_dev';

  console.log('========================================');
  console.log('  Enhanced Database Seeder');
  console.log('========================================');
  console.log(`Environment: ${nodeEnv}`);
  console.log(`Clean mode: ${cleanFlag ? 'ENABLED ⚠️' : 'DISABLED'}`);
  console.log(`Duplicate check: ${preventDuplicates ? 'ENABLED ✓' : 'DISABLED'}`);
  console.log(`Database host: ${dbHost}:${dbPort}`);
  console.log(`Database name: ${dbName}`);
  console.log(`Database user: ${dbUsername}`);
  console.log('========================================\n');

  // Safety check: Confirm clean mode in production
  if (cleanFlag) {
    const confirmed = await confirmProductionClean(nodeEnv);
    if (!confirmed) {
      console.log('Exiting without changes.');
      process.exit(0);
    }
  }

  // Create DataSource
  const dataSource = new DataSource({
    type: 'postgres',
    host: dbHost,
    port: dbPort,
    username: dbUsername,
    password: dbPassword,
    database: dbName,
    entities: [Product],
    synchronize: false, // Never use synchronize in production
    logging: false,
  });

  try {
    // Initialize connection
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Database connected successfully!\n');

    // Run enhanced product seeder
    const productSeeder = new EnhancedProductSeeder(dataSource);
    await productSeeder.run(cleanFlag, preventDuplicates);

    console.log('\n========================================');
    console.log('  Seeding completed successfully!');
    console.log('========================================');
  } catch (error) {
    console.error('\n========================================');
    console.error('  Seeding failed!');
    console.error('========================================');
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run seeders
runSeeders();
