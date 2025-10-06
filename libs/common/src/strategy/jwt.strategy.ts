// apps/identity/src/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, @Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      // Specifies how to extract the token from the request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Ensures that expired tokens are rejected
      ignoreExpiration: false,
      // The secret key to verify the token's signature
      secretOrKey: jwtSecret,
      passReqToCallback: true, // To access the request object in validate method
    });
  }

  /**
   * This method is called automatically by NestJS after a token
   * has been successfully verified.
   * @param payload The decoded content of the JWT.
   * @returns The payload, which will be attached to the request object as `req.user`.
   */
  async validate(req: any, payload: any) {
    // Extract token from request
    console.log(req.headers);
    const token = req.headers.authorization.split(' ')[1];

    // Check if the token is in the blocklist
    const isBlocked = await this.cacheManager.get(`blocklist:${token}`);
    if (isBlocked) {
      throw new UnauthorizedException('Token has been invalidated');
    }
    return { id: payload.id, email: payload.email };
  }
}