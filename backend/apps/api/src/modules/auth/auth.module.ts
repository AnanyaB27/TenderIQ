import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleOauthStrategy } from './strategies/google-oauth.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleOauthStrategy],
})
export class AuthModule {}
