import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { validationSchema } from './config/environment.validation';
import { ProductsModule } from './modules/products/products.module';
import { AboutSectionsModule } from './modules/about-sections/about-sections.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

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
    AboutSectionsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JWT authentication globally to all routes
    // Routes can opt-out using @Public() decorator
    // Using useFactory to properly inject Reflector dependency
    {
      provide: APP_GUARD,
      useFactory: (reflector) => new JwtAuthGuard(reflector),
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
