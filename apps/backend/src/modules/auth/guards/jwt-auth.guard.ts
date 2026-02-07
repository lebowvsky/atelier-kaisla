import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT Authentication Guard
 * Protects routes with JWT authentication
 * Routes marked with @Public() decorator will skip authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
    this.logger.log('JwtAuthGuard initialized');
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug(`Public route accessed: ${method} ${url}`);
      return true;
    }

    this.logger.debug(`Protected route accessed: ${method} ${url}`);

    // Otherwise, perform JWT authentication
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    if (err || !user) {
      this.logger.warn(
        `Authentication failed for ${method} ${url}: ${info?.message || err?.message || 'Unknown error'}`,
      );
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }

    this.logger.debug(
      `Authentication successful for ${method} ${url} - User: ${user.username}`,
    );
    return user;
  }
}
