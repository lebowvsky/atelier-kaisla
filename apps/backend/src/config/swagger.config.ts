import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configure Swagger/OpenAPI documentation
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Atelier Kaisla API')
    .setDescription(
      'Backend API for Atelier Kaisla e-commerce platform - handcrafted wall art and rugs',
    )
    .setVersion('1.0')
    .addTag('products', 'Product management endpoints')
    .addBearerAuth() // For future JWT authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Atelier Kaisla API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });
}
