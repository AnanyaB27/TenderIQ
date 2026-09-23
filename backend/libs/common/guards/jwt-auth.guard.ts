import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Delegates authentication to the underlying JwtStrategy
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Throw an explicit exception if JWT validation fails or is missing
    if (err || !user) {
      throw err || new UnauthorizedException('Valid JWT token is missing or expired.');
    }
    return user;
  }
}