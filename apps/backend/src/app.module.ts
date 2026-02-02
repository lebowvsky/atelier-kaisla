import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { validationSchema } from './config/environment.validation';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    // Configuration module - loads .env files and validates environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available globally
      envFilePath: [
        '../../.env.local', // Root of monorepo
        '../../.env',
        '.env.local', // Backend directory (fallback)
        '.env',
      ],
      validationSchema,
      validationOptions: {
        allowUnknown: true, // Allow env vars not in schema
        abortEarly: false, // Check all variables, not just first error
      },
    }),

    // TypeORM module - database connection
    TypeOrmModule.forRoot(getDatabaseConfig()),

    // Feature modules
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
