import { Controller, Get } from '@nestjs/common';

/**
 * Exemple de Health Check Controller pour NestJS
 *
 * À ajouter dans apps/backend/src/health/health.controller.ts
 * et à importer dans app.module.ts
 *
 * Ce controller permet au healthcheck Docker de vérifier
 * que l'application est bien démarrée et fonctionnelle.
 */

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
