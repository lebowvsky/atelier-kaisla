import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

/**
 * JWT Strategy
 * Validates JWT tokens and returns authenticated user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    });
    this.logger.log(
      `JWT Strategy initialized with secret: ${process.env.JWT_SECRET ? '***' : 'USING DEFAULT'}`,
    );
  }

  /**
   * Validate JWT payload
   * This method is called after JWT is verified
   * @param payload - JWT payload
   * @returns User object if valid
   */
  async validate(payload: any) {
    this.logger.debug(
      `Validating JWT payload for user: ${payload.username} (id: ${payload.sub})`,
    );

    const user = await this.authService.getUserById(payload.sub);

    if (!user) {
      this.logger.warn(`User not found for id: ${payload.sub}`);
      throw new UnauthorizedException('User not found');
    }

    this.logger.debug(`JWT validation successful for user: ${user.username}`);

    // Return user object (attached to request.user by Passport)
    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }
}
