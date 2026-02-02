import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Global validation pipe - validates all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      // Strip properties not in DTO
      whitelist: true,
      // Throw error if non-whitelisted properties exist
      forbidNonWhitelisted: true,
      // Transform payloads to DTO instances
      transform: true,
      // Transform primitive types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS for frontend applications
  app.enableCors({
    origin: [
      'http://localhost:3002', // Frontend
      'http://localhost:3001', // Backoffice
      process.env.FRONTEND_URL,
      process.env.BACKOFFICE_URL,
    ].filter(Boolean),
    credentials: true,
  });

  // Setup Swagger documentation (only in development)
  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  logger.log(`🚀 Backend API is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(
    `🗄️  Database: ${process.env.POSTGRES_DB || process.env.DATABASE_NAME || 'atelier_kaisla_dev'}`,
  );
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
